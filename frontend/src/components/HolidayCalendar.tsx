import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './HolidayCalendar.module.css';
import type { HolidaysTypes } from 'date-holidays';
import { useMemo } from 'react';
import dayjs from 'dayjs';

const localizer = dayjsLocalizer(dayjs);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface HolidayCalendarProps {
  data: HolidaysTypes.Holiday[];
  date?: Date;
  setDate: (date: Date) => void;
}

export const HolidayCalendar = ({ data, date, setDate }: HolidayCalendarProps) => {
  const events = useMemo(
    () =>
      data.map<Event>((d) => ({
        id: d.date,
        title: d.name,
        start: new Date(d.start),
        end: new Date(d.end),
      })),
    [data],
  );

  return (
    <div className="w-full space-y-4">
      <div className="h-[450px] w-full ">
        <Calendar
          className={styles.calendar}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          date={date}
          onNavigate={setDate}
          defaultView="month"
          showAllEvents
          step={60}
          eventPropGetter={() => ({
            style: {
              backgroundColor: 'var(--color-lime-200)',
              borderRadius: '4px',
              border: 'none',
              fontSize: '12px',
              padding: '2px 6px',
            },
          })}
          components={{
            toolbar: () => null,
            event: ({ event }) => (
              <div className="truncate text-slate-900 text-xs font-medium">{event.title}</div>
            ),
          }}
        />
      </div>
    </div>
  );
};
