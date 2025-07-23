import useSWR from 'swr';
import type { VacationFormData, VacationResult } from '@/types/vacations.ts';

export const useCalendar = (data: VacationFormData | null) =>
  useSWR(
    data
      ? ['/api/calendars/optimize', data.year, data.country, data.availableDays, data.strategy]
      : null,
    ([url, year, country, days, strategy]) =>
      fetch(`${url}?year=${year}&country=${country}&days=${days}&strategy=${strategy}`).then(
        (res) => res.json() as unknown as VacationResult,
      ),
    {},
  );
