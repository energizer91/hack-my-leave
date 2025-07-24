import { useState, useEffect } from 'react';

const STORAGE_KEY = 'country';

export const usePersistedCountry = (initialCountry?: string) => {
  const [country, setCountry] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ?? initialCountry ?? '';
  });

  useEffect(() => {
    if (country) {
      localStorage.setItem(STORAGE_KEY, country);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [country]);

  return [country, setCountry] as const;
};
