import { Legend } from '@/components/Legend.tsx';
import { VectorCalendarView } from '@/components/VectorCalendarView.tsx';
import type { VacationResult } from '@/types/vacations.ts';

interface ResultBlockProps {
  data?: VacationResult;
  year?: number;
}

export const ResultBlock = ({ data, year }: ResultBlockProps) => {
  if (!data) return null;

  return (
    <section className="flex flex-col items-center mt-16">
      <h2 className="text-4xl font-bold mb-6">Your result</h2>
      <Legend />
      <VectorCalendarView suggestions={data?.suggestions} holidays={data?.holidays} year={year} />
    </section>
  );
};
