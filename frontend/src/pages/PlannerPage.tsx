import { useEffect, useState } from 'react';
import type { VacationFormData } from '../types/vacations';
import { useCalendar } from '../hooks/useCalendar';
import { WelcomeBlock } from '@/components/WelcomeBlock.tsx';
import { ResultBlock } from '../components/ResultBlock';
import { usePersistedCountry } from '@/hooks/usePersistentCountry.ts';
import { CountrySelector } from '@/components/CountrySelector.tsx';
import { toast } from 'sonner';

export const PlannerPage = () => {
  const [params, setParams] = useState<VacationFormData | null>(null);
  const [country, setCountry] = usePersistedCountry();
  const { data, isLoading, error } = useCalendar(params, country);

  useEffect(() => {
    error &&
      toast.error('Something went wrong!', {
        description: error.message,
        duration: 5000,
      });
  }, [error]);

  return (
    <>
      <CountrySelector title="Vacation Planner for" country={country} onChange={setCountry} />
      <WelcomeBlock
        ready={!country}
        isLoading={isLoading}
        onSubmit={setParams}
        data={data}
        availableDays={params?.availableDays}
      />
      <ResultBlock data={data} year={params?.year} />
    </>
  );
};
