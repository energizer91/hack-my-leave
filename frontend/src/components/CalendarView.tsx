import type { VacationSuggestion } from "../types/vacations";

interface CalendarViewProps {
  highlights: VacationSuggestion[];
}

export default function CalendarView({ highlights }: CalendarViewProps) {
  if (!highlights || highlights.length === 0) return <div>Calendar will appear here</div>;
  return (
    <div>
      <strong>Vacation periods:</strong>
      <ul>
        {highlights.map((item, idx) => (
          <li key={idx}>{item.start} — {item.end} ({item.name})</li>
        ))}
      </ul>
    </div>
  );
}

// Note: This component is a placeholder and should be replaced with a more user-friendly UI.