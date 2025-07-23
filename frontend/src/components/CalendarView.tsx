import { useMemo } from 'react';
import type { VacationSuggestion } from '../types/vacations';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import styles from './CalendarView.module.css';
import type { HolidaysTypes } from 'date-holidays';

interface CalendarViewProps {
  year?: number;
  suggestions?: VacationSuggestion[];
  holidays?: HolidaysTypes.Holiday[];
}

export const CalendarView = ({ year, suggestions = [], holidays = [] }: CalendarViewProps) => {
  const holidaysByMonth = useMemo(() => {
    const monthMap: Record<number, HolidaysTypes.Holiday[]> = {};

    holidays.forEach((holiday) => {
      const date = new Date(holiday.date);
      const month = date.getMonth();

      if (!monthMap[month]) {
        monthMap[month] = [];
      }
      monthMap[month].push(holiday);
    });

    return monthMap;
  }, [holidays]);

  const formatHolidaysText = (monthHolidays: HolidaysTypes.Holiday[]): string => {
    if (monthHolidays.length === 0) return 'No holidays';

    if (monthHolidays.length === 1) {
      return monthHolidays[0].name;
    }

    if (monthHolidays.length === 2) {
      return `${monthHolidays[0].name} and ${monthHolidays[1].name}`;
    }

    return `${monthHolidays[0].name} and ${monthHolidays.length - 1} more holidays`;
  };

  const modifiers = useMemo(
    () =>
      suggestions.reduce(
        (acc, h) => {
          acc.pto.push(
            ...h.vacations
              .map((d) => new Date(d))
              .filter((d) => d.getDay() !== 0 && d.getDay() !== 6),
          );
          acc.weekend.push(
            ...h.vacations
              .map((d) => new Date(d))
              .filter((d) => d.getDay() === 0 || d.getDay() === 6),
          );

          return acc;
        },
        {
          pto: [] as Date[],
          weekend: [] as Date[],
        },
      ),
    [suggestions],
  );

  const holidayModifiers = useMemo(
    () =>
      holidays.reduce(
        (acc, h) => {
          acc.holiday.push(new Date(h.date));
          return acc;
        },
        { holiday: [] as Date[] },
      ),
    [holidays],
  );

  return (
    <div className={styles.yearCalendarGrid}>
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const monthHolidays = holidaysByMonth[monthIndex] || [];
        const holidaysText = formatHolidaysText(monthHolidays);

        return (
          <Card key={monthIndex} className="gap-2">
            <CardHeader className={styles.cardHeader}>
              <p className={styles.holidaysText}>{holidaysText}</p>
            </CardHeader>

            <CardContent className="p-0">
              <Calendar
                className={styles.monthCalendar}
                hideNavigation
                month={new Date(year ?? 2025, monthIndex)}
                numberOfMonths={1}
                weekStartsOn={1}
                fixedWeeks
                mode="single"
                onSelect={() => {}}
                modifiers={{ ...modifiers, ...holidayModifiers }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
