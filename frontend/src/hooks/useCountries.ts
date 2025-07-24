import useSWR from 'swr';

export const useCountries = () =>
  useSWR(
    '/api/calendars/countries',
    (url) => fetch(url).then((res) => res.json() as unknown as Record<string, string>),
    {},
  );
