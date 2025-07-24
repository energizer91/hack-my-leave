import { CountrySelect } from '@/components/CountrySelect.tsx';

interface CountrySelectorProps {
  country?: string;
  title?: string;
  onChange: (country: string) => void;
}

export const CountrySelector = ({ title, country, onChange }: CountrySelectorProps) => {
  return (
    <section className="mb-9 flex flex-col sm:flex-row items-center gap-3">
      <h2 className="font-semibold text-3xl">{title}</h2>
      <CountrySelect country={country} onChange={onChange} />
    </section>
  );
};
