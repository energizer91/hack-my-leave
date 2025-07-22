import { useState } from 'react';
import './index.css';
import VacationForm from './components/VacationForm';
import { BestOptionCard } from './components/BestOptionCardTest';
import CalendarView from './components/CalendarView';
import type { VacationFormData } from './types/vacations';
import { useCalendar } from './hooks/useCalendar';

function App() {
  const [params, setParams] = useState<VacationFormData | null>(null);
  const { isLoading, error, data } = useCalendar(params);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 40 }}>
      <h1>Hack My Leave</h1>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <VacationForm onSubmit={setParams} />
        </div>
        <div style={{ flex: 2 }}>
          {isLoading && 'Loading...'}
          {error && error.message}
          <BestOptionCard data={data} />
          <CalendarView highlights={data ? data.suggestions : []} />
        </div>
      </div>
      <div className="p-4 bg-blue-100">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
      </div>
    </div>
  );
}

export default App;
