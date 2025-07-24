import useSWR from 'swr';
import type { HolidaysTypes } from 'date-holidays';

export const useVacations = (year?: number, country?: string) =>
  useSWR(
    year && country ? ['/api/calendars/holidays', year, country] : null,
    ([url, year, country]) =>
      fetch(`${url}?year=${year}&country=${country}`).then(
        (res) => res.json() as unknown as HolidaysTypes.Holiday[],
      ),
    {},
  );
