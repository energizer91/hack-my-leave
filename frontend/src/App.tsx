import { useState } from "react";
import './index.css';
import VacationForm from "./components/VacationForm";
import BestOptionCardTest from "./components/BestOptionCardTest";
import CalendarView from "./components/CalendarView";
import type { VacationResult, VacationFormData } from "./types/vacations";

function App() {
  const [params, setParams] = useState<VacationFormData | null>(null);
  const [result, setResult] = useState<VacationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleFormSubmit = async (formData: VacationFormData) => {
    setParams(formData);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/calendars/optimize?year=${formData.year}&country=${formData.country}&days=${formData.availableDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Ошибка при получении данных с сервера");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 40 }}>
      <h1>Hack My Leave</h1>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1 }}>
          <VacationForm onSubmit={handleFormSubmit} />
        </div>
        <div style={{ flex: 2 }}>
          {/* placeholder */}
          <BestOptionCardTest data={result} />
          <CalendarView highlights={result ? result.suggestions : []} />
        </div>
      </div>
      <div className="p-4 bg-blue-100">
  <h1 className="text-3xl font-bold underline">
      Hello world!
</h1>
</div>
    </div>
  );
}

export default App;
