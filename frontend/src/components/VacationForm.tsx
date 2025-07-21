import { useState } from "react";
import type { VacationFormData } from "../types/vacations";
import { DaysInput, YearInput, CountrySelect } from "./VacationFormFields";

interface VacationFormProps {
  onSubmit: (data: VacationFormData) => void;
}

export default function VacationForm({ onSubmit }: VacationFormProps) {
  const [availableDays, setAvailableDays] = useState("");
  const [year, setYear] = useState("2025");
  const [country, setCountry] = useState("SE");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!availableDays || !year || !country) {
      alert("Please fill all fields");
      return;
    }
    onSubmit({ availableDays, year, country });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DaysInput value={availableDays} onChange={setAvailableDays} />
      <YearInput value={year} onChange={setYear} />
      <CountrySelect value={country} onChange={setCountry} />
      <button type="submit" style={{ marginTop: 16 }}>
        Optimize Vacation
      </button>
    </form>
  );
}
