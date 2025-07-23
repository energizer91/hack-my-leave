import useSWR from 'swr';
import type { VacationStrategy } from '@/types/vacations.ts';

export const useStrategies = () =>
  useSWR(
    '/api/calendars/strategies',
    (url) => fetch(url).then((res) => res.json() as unknown as VacationStrategy[]),
    {},
  );
