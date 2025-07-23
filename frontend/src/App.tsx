import { useState } from 'react';
import { VacationForm } from './components/VacationForm';
import type { VacationFormData } from './types/vacations';
import { useCalendar } from './hooks/useCalendar';
import { VacationSummary } from '@/components/VacationSummary';
import { Legend } from '@/components/Legend.tsx';
import { VirtualCalendarView } from '@/components/VirtualCalendarView';

import './index.css';

function App() {
  const [params, setParams] = useState<VacationFormData | null>(null);
  const { data } = useCalendar(params);

  const handleSubmit = (formData: VacationFormData) => {
    setParams({
      year: formData.year,
      country: formData.country,
      availableDays: formData.availableDays,
      strategy: formData.strategy,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-8">Hack My Leave</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <VacationForm onSubmit={handleSubmit} />
        </div>
        <div className="w-full lg:w-2/3">
          {data && (
            <VacationSummary
              suggestions={data.suggestions}
              holidays={data.holidays}
              totalVacationDays={params?.availableDays}
            />
          )}
        </div>
      </div>
      {data && (
        <div className="flex flex-col items-center mt-16">
          <h2 className="text-4xl font-bold mb-6">Your result</h2>
          <Legend />
          <VirtualCalendarView
            suggestions={data?.suggestions}
            holidays={data?.holidays}
            year={params?.year}
          />
        </div>
      )}
    </div>
  );
}

export default App;
