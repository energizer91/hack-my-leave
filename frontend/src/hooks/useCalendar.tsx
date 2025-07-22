import useSWR from 'swr';
import type { VacationFormData, VacationResult } from '@/types/vacations.ts';

export const useCalendar = (data: VacationFormData | null) =>
  useSWR(
    data ? (['/api/calendars/optimize', data] as const) : null,
    ([url, { year, country, availableDays }]) =>
      fetch(`${url}?year=${year}&country=${country}&days=${availableDays}`).then(
        (res) => res.json() as unknown as VacationResult,
      ),
    {},
  );
