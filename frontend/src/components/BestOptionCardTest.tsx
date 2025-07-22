import type { VacationResult } from '../types/vacations';

interface BestOptionCardProps {
  data: VacationResult | undefined;
}

export function BestOptionCard({ data }: BestOptionCardProps) {
  if (!data) return <div>Result will appear here</div>;
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
