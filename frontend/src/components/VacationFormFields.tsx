export function DaysInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label>
      Available Days:
      <input
        type="number"
        value={value}
        min={1}
        onChange={e => onChange(e.target.value)}
        required
        style={{ marginLeft: 8, width: 80 }}
      />
    </label>
  );
}

export function YearInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label>
      Year:
      <input
        type="number"
        value={value}
        min={2023}
        max={2100}
        onChange={e => onChange(e.target.value)}
        required
        style={{ marginLeft: 8, width: 80 }}
      />
    </label>
  );
}

export function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label>
      Country:
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        style={{ marginLeft: 8, width: 120 }}
      >
        <option value="SE">Sweden</option>
        <option value="DE">Germany</option>
        <option value="FI">Finland</option>
      </select>
    </label>
  );
}
