import type { VacationResult } from "../types/vacations";

interface BestOptionCardProps {
  data: VacationResult | null;
}

function BestOptionCardTest({ data }: BestOptionCardProps) {
  if (!data) return <div>Result will appear here</div>;
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default BestOptionCardTest;
// Note: This component is a placeholder and should be replaced with a more user-friendly UI.