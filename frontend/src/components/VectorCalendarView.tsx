import { useMemo, useState, useCallback, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { VacationSuggestion } from '../types/vacations';
import type { HolidaysTypes } from 'date-holidays';
import dayjs from 'dayjs';
import styles from './VectorCalendarView.module.css';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils.ts';

interface GridSVGCalendarProps {
  year?: number;
  suggestions?: VacationSuggestion[];
  holidays?: HolidaysTypes.Holiday[];
}

// @ts-expect-error wtf
enum HOLIDAY_TYPE {
  HOLIDAY,
  VACATION_WEEKEND,
  VACATION_WEEKDAY,
  EXTENDED_WEEKEND,
}

interface TooltipInfo {
  name: string;
  type: HOLIDAY_TYPE;
}

// Константы для фиксированного календаря 300px
const CELL_SIZE = 38; // Увеличиваем для лучшей читаемости
const CALENDAR_WIDTH = CELL_SIZE * 7;
const CELL_HORIZONTAL_GAP = 0;
const CELL_VERTICAL_GAP = 8;
const HEADER_HEIGHT = 70;
// Фиксированные размеры каждого месяца - ровно 300px
const monthHeight = 6 * (CELL_SIZE + CELL_VERTICAL_GAP) + HEADER_HEIGHT + 10; // +10 для отступов

const formatHolidaysText = (monthHolidays: HolidaysTypes.Holiday[]) => {
  if (monthHolidays.length === 0) return 'No holidays';
  if (monthHolidays.length === 1) return monthHolidays[0].name;
  if (monthHolidays.length === 2) {
    return `${monthHolidays[0].name} and ${monthHolidays[1].name}`;
  }
  return `${monthHolidays[0].name} and ${monthHolidays.length - 1} more holidays`;
};

const getTooltipTypeText = (type: HOLIDAY_TYPE) => {
  switch (type) {
    case HOLIDAY_TYPE.HOLIDAY:
      return 'Holiday';
    case HOLIDAY_TYPE.VACATION_WEEKDAY:
      return 'Vacation day';
    case HOLIDAY_TYPE.VACATION_WEEKEND:
      return 'Vacation weekend';
    case HOLIDAY_TYPE.EXTENDED_WEEKEND:
      return 'Extended weekend';
    default:
      return '';
  }
};

const getCellColor = (cellType: string) => {
  switch (cellType) {
    case 'holiday':
      return 'var(--color-red-200)';
    case 'vacation-weekday':
      return 'var(--color-violet-200)';
    case 'vacation-weekend':
      return 'var(--color-lime-200)';
    default:
      return '#ffffff';
  }
};

const getTextColor = (cellType: string, isCurrentMonth: boolean) => {
  if (!isCurrentMonth) return '#9ca3af';

  switch (cellType) {
    case 'holiday':
      return 'var(--color-red-700)';
    default:
      return '#374151';
  }
};

export const VectorCalendarView = ({
  year = 2025,
  suggestions = [],
  holidays = [],
}: GridSVGCalendarProps) => {
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
    const holidayMap = new Map<string, HolidaysTypes.Holiday>();
    holidays.forEach((holiday) => {
      const key = dayjs(holiday.date).format('YYYY-MM-DD');
      holidayMap.set(key, holiday);
    });

    const vacationMap = new Map<string, VacationSuggestion>();
    suggestions.forEach((suggestion) => {
      suggestion.vacations.forEach((vacationDate) => {
        const key = dayjs(vacationDate).format('YYYY-MM-DD');
        vacationMap.set(key, suggestion);
      });
    });

    return Array.from({ length: 12 }, (_, monthIndex) => {
      const monthStart = dayjs().year(year).month(monthIndex).startOf('month');
      const startOfWeek = monthStart.startOf('week').add(1, 'day');

      const days = [];
      let current = startOfWeek;

      for (let i = 0; i < 42; i++) {
        const dateKey = current.format('YYYY-MM-DD');
        const isCurrentMonth = current.month() === monthIndex;
        const isWeekend = current.day() === 0 || current.day() === 6;
        const holiday = holidayMap.get(dateKey);
        const vacation = vacationMap.get(dateKey);

        let cellType = 'normal';
        let tooltipInfo: TooltipInfo | null = null;

        if (holiday) {
          cellType = 'holiday';
          tooltipInfo = {
            name: holiday.name,
            type: vacation ? HOLIDAY_TYPE.EXTENDED_WEEKEND : HOLIDAY_TYPE.HOLIDAY,
          };
        } else if (vacation) {
          cellType = isWeekend ? 'vacation-weekend' : 'vacation-weekday';
          tooltipInfo = {
            name: vacation.name,
            type: isWeekend ? HOLIDAY_TYPE.VACATION_WEEKEND : HOLIDAY_TYPE.VACATION_WEEKDAY,
          };
        } else if (isWeekend) {
          cellType = 'weekend';
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
  }, [year, holidays, suggestions]);

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
                height={monthHeight}
                className={styles.calendarSvg}
                viewBox={`0 0 ${CALENDAR_WIDTH} ${monthHeight}`}
              >
                <text
                  x={CALENDAR_WIDTH / 2}
                  y={18}
                  textAnchor="middle"
                  className={styles.monthTitle}
                >
                  {month.name} {year}
                </text>

                {/* Holiday summary */}
                <text
                  x={CALENDAR_WIDTH / 2}
                  y={38}
                  textAnchor="middle"
                  className={styles.holidayText}
                >
                  {formatHolidaysText(month.holidays)}
                </text>

                {/* Weekday headers */}
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((weekday, i) => (
                  <text
                    key={weekday}
                    x={i * (CELL_SIZE + CELL_HORIZONTAL_GAP) + CELL_SIZE / 2}
                    y={HEADER_HEIGHT - 5}
                    textAnchor="middle"
                    className={styles.weekdayText}
                  >
                    {weekday}
                  </text>
                ))}

                {/* Calendar cells */}
                {month.days.map((day, index) => (
                  <g key={`${month.name}_${day.day}_${index}`}>
                    <rect
                      x={day.x}
                      y={day.y}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={getCellColor(day.cellType)}
                      strokeWidth="1"
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
                      x={day.x + CELL_SIZE / 2} // +10 отступ слева
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

      {/* Portal tooltip */}
      {tooltip.visible &&
        tooltip.content &&
        createPortal(
          <div
            className={styles.tooltip}
            style={{
              left: tooltip.x - 50, // смещаем влево на половину ширины тултипа (~100px)
              top: tooltip.y - 60, // поднимаем выше ячейки
            }}
          >
            <p className={styles.tooltipTitle}>{tooltip.content.name}</p>
            <p className={styles.tooltipType}>{getTooltipTypeText(tooltip.content.type)}</p>
          </div>,
          document.body,
        )}
    </>
  );
};
