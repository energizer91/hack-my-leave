import { Legend } from './Legend.tsx';
import { VectorCalendarView } from './VectorCalendarView.tsx';
import type { VacationResult } from '@/types/vacations.ts';

interface ResultBlockProps {
  data?: VacationResult;
  year?: number;
  skipPast?: boolean;
}

export const ResultBlock = ({ data, year, skipPast = false }: ResultBlockProps) => {
  if (!data) return null;

  return (
    <section className="flex flex-col items-center mt-16">
      <h2 className="text-4xl font-bold mb-6">Your result</h2>
      <Legend />
      <VectorCalendarView
        suggestions={data?.suggestions}
        holidays={data?.holidays}
        year={year}
        skipPast={skipPast}
      />
    </section>
  );
};
