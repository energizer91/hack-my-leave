import { CountrySelect } from '@/components/CountrySelect.tsx';

interface CountrySelectorProps {
  country?: string;
  onChange: (country: string) => void;
}

export const CountrySelector = ({ country, onChange }: CountrySelectorProps) => {
  return (
    <section className="mb-9 flex flex-col sm:flex-row items-center gap-3">
      <h2 className="font-semibold text-3xl">Vacation Planner for</h2>
      <CountrySelect country={country} onChange={onChange} />
    </section>
  );
};
