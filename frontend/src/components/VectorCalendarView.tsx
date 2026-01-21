import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { VacationSuggestion } from '../types/vacations';
import type { HolidaysTypes } from 'date-holidays';
import dayjs from 'dayjs';
import styles from './VectorCalendarView.module.css';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils.ts';
import { holidayTypes } from '@/lib/holidayTypes.ts';

interface VectorCalendarViewProps {
  year?: number;
  suggestions?: VacationSuggestion[];
  holidays?: HolidaysTypes.Holiday[];
  skipPast?: boolean;
}

// @ts-expect-error wtf
enum VACATION_TYPE {
  HOLIDAY,
  VACATION_WEEKEND,
  VACATION_WEEKDAY,
  EXTENDED_WEEKEND,
}

interface TooltipInfo {
  name: string;
  holiday?: HolidaysTypes.HolidayType;
  type?: VACATION_TYPE;
}

const ROW_COUNT = 6;
const COLUMN_COUNT = 7;
const HEADER_HEIGHT = 70;
const CELL_SIZE = 38;
const CELL_HORIZONTAL_GAP = 0;
const CELL_VERTICAL_GAP = 8;
const CELL_BORDER_RADIUS = 0;
const CALENDAR_WIDTH = CELL_SIZE * COLUMN_COUNT + CELL_HORIZONTAL_GAP * (COLUMN_COUNT - 1);
const CALENDAR_HEIGHT = ROW_COUNT * (CELL_SIZE + CELL_VERTICAL_GAP) + HEADER_HEIGHT;

const months = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const formatHolidaysText = (monthHolidays: HolidaysTypes.Holiday[]) => {
  if (monthHolidays.length === 0) return 'No holidays';
  if (monthHolidays.length === 1) return monthHolidays[0].name;
  if (monthHolidays.length === 2) {
    return `${monthHolidays[0].name} and ${monthHolidays[1].name}`;
  }
  return `${monthHolidays[0].name} and ${monthHolidays.length - 1} more holidays`;
};

const getHolidayTypeText = (holidayType: HolidaysTypes.HolidayType) => {
  switch (holidayType) {
    case 'public':
      return 'Public holiday';
    case 'bank':
      return 'Bank holiday';
    case 'school':
      return 'School holiday';
    case 'optional':
      return 'Optional holiday';
    case 'observance':
      return 'Observance holiday';
  }
};

const getTooltipTypeText = (info: TooltipInfo) => {
  switch (info.type) {
    case VACATION_TYPE.HOLIDAY:
      return getHolidayTypeText(info.holiday!);
    case VACATION_TYPE.VACATION_WEEKDAY:
      return 'Vacation day';
    case VACATION_TYPE.VACATION_WEEKEND:
      return 'Vacation weekend';
    case VACATION_TYPE.EXTENDED_WEEKEND:
      return 'Extended vacation';
    default:
      return '';
  }
};

const getCellColor = (cellType: string) => {
  if (cellType === 'disabled') return 'var(--color-gray-100)';
  if (cellType === 'today') return 'var(--color-blue-100)';

  return holidayTypes[cellType]?.color ?? '#ffffff';
};

const getTextColor = (cellType: string, isCurrentMonth: boolean) => {
  if (!isCurrentMonth) return '#9ca3af';

  return holidayTypes[cellType]?.text ?? '#374151';
};

const OPTIONAL_HOLIDAYS = ['optional', 'observance'];

export const VectorCalendarView = ({
  year = 2025,
  suggestions = [],
  holidays = [],
  skipPast = false,
}: VectorCalendarViewProps) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: TooltipInfo | null;
    x: number;
    y: number;
  }>({
    visible: false,
    content: null,
    x: 0,
    y: 0,
  });

  // Предвычисляем все данные один раз
  const calendarData = useMemo(() => {
    const today = dayjs();
    const holidayMap = new Map<string, HolidaysTypes.Holiday>();
    holidays.forEach((holiday) => {
      const key = dayjs(holiday.date).format('YYYY-MM-DD');
      holidayMap.set(key, holiday);
    });

    const vacationMap = new Map<string, VacationSuggestion>();
    const weekendMap = new Map<string, VacationSuggestion>();
    suggestions.forEach((suggestion) => {
      const start = dayjs(suggestion.start);
      const end = dayjs(suggestion.end);

      if (start.day() === 0) {
        // sunday, add this and prev saturday
        weekendMap.set(suggestion.start, suggestion);
        weekendMap.set(start.subtract(1, 'day').format('YYYY-MM-DD'), suggestion);
      }

      if (start.day() === 6) {
        // saturday, add this and next sunday
        weekendMap.set(suggestion.start, suggestion);
        weekendMap.set(start.add(1, 'day').format('YYYY-MM-DD'), suggestion);
      }

      if (end.day() === 0) {
        // sunday, add this and prev saturday
        weekendMap.set(suggestion.end, suggestion);
        weekendMap.set(end.subtract(1, 'day').format('YYYY-MM-DD'), suggestion);
      }

      if (end.day() === 6) {
        // saturday, add this and next sunday
        weekendMap.set(suggestion.end, suggestion);
        weekendMap.set(end.add(1, 'day').format('YYYY-MM-DD'), suggestion);
      }

      suggestion.vacations.forEach((vacationDate) => {
        vacationMap.set(vacationDate, suggestion);
      });
    });

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthStart = today.year(year).month(monthIndex).startOf('month');
      const startOfWeek = monthStart.startOf('week').add(1, 'day');

      const days = [];
      let current = startOfWeek;

      for (let i = 0; i < ROW_COUNT * COLUMN_COUNT; i++) {
        const dateKey = current.format('YYYY-MM-DD');
        const isCurrentMonth = current.month() === monthIndex;
        const weekend = weekendMap.get(dateKey);
        const holiday = holidayMap.get(dateKey);
        const vacation = vacationMap.get(dateKey);
        const disabled = current.isBefore(today, 'day');
        const isToday = current.isSame(today, 'day');

        let cellType = 'normal';
        let tooltipInfo: TooltipInfo | null = null;

        if (holiday) {
          cellType = OPTIONAL_HOLIDAYS.includes(holiday.type) ? 'optional' : 'holiday';
          tooltipInfo = {
            name: holiday.name,
            holiday: holiday.type,
            type: vacation ? VACATION_TYPE.EXTENDED_WEEKEND : VACATION_TYPE.HOLIDAY,
          };
        } else if (weekend) {
          cellType = 'additional';
          tooltipInfo = {
            name: weekend.name,
            type: VACATION_TYPE.VACATION_WEEKEND,
          };
        } else if (disabled && skipPast) {
          cellType = 'disabled';
        } else if (vacation) {
          cellType = 'vacation';
          tooltipInfo = {
            name: vacation.name,
            type: VACATION_TYPE.VACATION_WEEKDAY,
          };
        } else if (isToday) {
          cellType = 'today';
          tooltipInfo = {
            name: 'Today',
          };
        }

        days.push({
          date: current.toDate(),
          day: current.date(),
          isCurrentMonth,
          cellType,
          tooltipInfo,
          x: (i % 7) * (CELL_SIZE + CELL_HORIZONTAL_GAP),
          y: Math.floor(i / 7) * (CELL_SIZE + CELL_VERTICAL_GAP) + HEADER_HEIGHT,
        });

        current = current.add(1, 'day');
      }

      return {
        name: monthStart.format('MMMM'),
        days,
        holidays: holidays.filter((h) => dayjs(h.date).month() === monthIndex),
      };
    });
  }, [year, holidays, suggestions, skipPast]);

  const handleCellMouseEnter = useCallback((event: MouseEvent, tooltipInfo: TooltipInfo) => {
    const rect = (event.target as SVGElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      content: tooltipInfo,
      x: rect.left + rect.width / 2, // центр ячейки по X
      y: rect.top + rect.height / 2, // центр ячейки по Y
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      <div className={styles.calendarGrid}>
        {calendarData.map((month) => (
          <Card key={month.name} className={styles.monthCard}>
            <CardContent className="p-3">
              <svg
                width={CALENDAR_WIDTH}
                height={CALENDAR_HEIGHT}
                className={styles.calendarSvg}
                viewBox={`0 0 ${CALENDAR_WIDTH} ${CALENDAR_HEIGHT}`}
              >
                <text
                  x={CALENDAR_WIDTH / 2}
                  y={18}
                  textAnchor="middle"
                  className={styles.monthTitle}
                >
                  {month.name} {year}
                </text>

                <text
                  x={CALENDAR_WIDTH / 2}
                  y={38}
                  textAnchor="middle"
                  className={styles.holidayText}
                >
                  {formatHolidaysText(month.holidays)}
                </text>

                {months.map((weekday, i) => (
                  <text
                    key={weekday}
                    x={i * (CELL_SIZE + CELL_HORIZONTAL_GAP) + CELL_SIZE / 2}
                    y={HEADER_HEIGHT - 7}
                    textAnchor="middle"
                    className={styles.weekdayText}
                  >
                    {weekday}
                  </text>
                ))}

                {month.days.map((day, index) => (
                  <g key={`${month.name}_${day.day}_${index}`}>
                    <rect
                      x={day.x}
                      y={day.y}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={getCellColor(day.cellType)}
                      strokeWidth="1"
                      rx={CELL_BORDER_RADIUS}
                      className={cn(
                        styles.calendarCell,
                        day.tooltipInfo ? styles.calendarCellPointer : styles.calendarCellDefault,
                      )}
                      onMouseEnter={
                        day.tooltipInfo
                          ? (e) => handleCellMouseEnter(e, day.tooltipInfo!)
                          : undefined
                      }
                      onMouseLeave={day.tooltipInfo ? handleMouseLeave : undefined}
                    />
                    <text
                      x={day.x + CELL_SIZE / 2}
                      y={day.y + CELL_SIZE / 2 + 5}
                      textAnchor="middle"
                      className={`${styles.dayText} ${styles.dayTextNoPointer}`}
                      fill={getTextColor(day.cellType, day.isCurrentMonth)}
                    >
                      {day.day}
                    </text>
                  </g>
                ))}
              </svg>
            </CardContent>
          </Card>
        ))}
      </div>

      {tooltip.visible &&
        tooltip.content &&
        createPortal(
          <div
            className={styles.tooltip}
            style={{
              left: tooltip.x - 50,
              top: tooltip.y - 60,
            }}
          >
            <p className={styles.tooltipTitle}>{tooltip.content.name}</p>
            {tooltip.content.type !== undefined && (
              <p className={styles.tooltipType}>{getTooltipTypeText(tooltip.content)}</p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
