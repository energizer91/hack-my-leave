import { useState } from 'react';
import { useVacations } from '@/hooks/useVacations.ts';
import { HolidayCalendar } from '@/components/HolidayCalendar.tsx';
import { CountrySelector } from '@/components/CountrySelector.tsx';
import { usePersistedCountry } from '@/hooks/usePersistentCountry.ts';
import { Button } from '@/components/ui/button.tsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { HolidayList } from '@/components/HolidayList.tsx';

export const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [country, setCountry] = usePersistedCountry();
  const { data = [] } = useVacations(date?.getFullYear(), country);

  const handlePrevious = () => {
    const newDate = dayjs(date).subtract(1, 'month').toDate();
    setDate(newDate);
  };

  const handleNext = () => {
    const newDate = dayjs(date).add(1, 'month').toDate();
    setDate(newDate);
  };

  const currentMonthYear = dayjs(date).format('MMMM YYYY');

  return (
    <>
      <CountrySelector title="Holiday Calendar for" country={country} onChange={setCountry} />
      <div className="flex items-center justify-center lg:justify-start py-4 gap-4">
        <Button variant="outline" size="icon" onClick={handlePrevious} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl min-w-[150px] text-center font-semibold">{currentMonthYear}</h2>
        <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="hidden lg:block flex-1/1 lg:flex-2/3">
          <HolidayCalendar data={data} date={date} setDate={setDate} />
        </div>
        <div className="flex-1/1 lg:flex-1/3">
          <HolidayList data={data} date={date} />
        </div>
      </div>
    </>
  );
};
