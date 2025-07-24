import { useState } from 'react';
import type { VacationFormData } from '../types/vacations';
import { useCalendar } from '../hooks/useCalendar';
import { WelcomeBlock } from '@/components/WelcomeBlock.tsx';
import { ResultBlock } from '../components/ResultBlock';
import { usePersistedCountry } from '@/hooks/usePersistentCountry.ts';
import { CountrySelector } from '@/components/CountrySelector.tsx';

export const PlannerPage = () => {
  const [params, setParams] = useState<VacationFormData | null>(null);
  const [country, setCountry] = usePersistedCountry();
  const { data, isLoading } = useCalendar(params, country);

  return (
    <>
      <CountrySelector country={country} onChange={setCountry} />
      <WelcomeBlock
        isLoading={isLoading}
        onSubmit={setParams}
        data={data}
        availableDays={params?.availableDays}
      />
      <ResultBlock data={data} year={params?.year} />
    </>
  );
};
