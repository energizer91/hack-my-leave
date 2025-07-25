import type { HolidaysTypes } from 'date-holidays';
import dayjs from 'dayjs';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface HolidayListProps {
  data?: HolidaysTypes.Holiday[];
}

export const HolidayList = ({ data = [] }: HolidayListProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="flex flex-col gap-2">
          {data.map((event) => (
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
