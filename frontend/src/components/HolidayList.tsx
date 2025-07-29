import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { HolidaysTypes } from 'date-holidays';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface HolidayListProps {
  data?: HolidaysTypes.Holiday[];
  date?: Date;
}

export const HolidayList = ({ data = [], date }: HolidayListProps) => {
  const vacationsPerMonth = useMemo(
    () => data.filter((d) => dayjs(d.date).isSame(date, 'month')),
    [data, date],
  );

  if (!data.length) {
    return (
      <Card className="flex flex-col justify-center items-center gap-3 text-center">
        <CardContent>
          <h3 className="font-semibold text-xl">
            Select a country to discover its annual holidays!
          </h3>
        </CardContent>
      </Card>
    );
  }

  if (!vacationsPerMonth.length) {
    return (
      <Card>
        <CardContent className="p-0 text-center font-medium">No holidays in this month</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="flex flex-col gap-2">
          {vacationsPerMonth.map((event) => (
            <li
              key={event.name}
              className="flex items-center justify-between px-4 hover:bg-muted-foreground/5"
            >
              <div className="text-sm text-muted-foreground">
                {dayjs(event.date).format('DD MMMM')}
              </div>
              <div className="font-medium">{event.name}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
