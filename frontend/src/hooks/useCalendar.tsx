import useSWR from 'swr';
import type { VacationFormData, VacationResult } from '@/types/vacations.ts';

export const useCalendar = (data: VacationFormData | null, country?: string) =>
  useSWR(
    data && country
      ? ['/api/calendars/optimize', data.year, data.availableDays, data.strategy, country]
      : null,
    ([url, year, days, strategy, country]) =>
      fetch(`${url}?year=${year}&country=${country}&days=${days}&strategy=${strategy}`).then(
        (res) => res.json() as unknown as VacationResult,
      ),
    {},
  );
