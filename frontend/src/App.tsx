import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/Header.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { PlannerPage } from '@/pages/PlannerPage.tsx';
import { CalendarPage } from '@/pages/CalendarPage.tsx';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Header />

        <Routes>
          <Route index element={<PlannerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="*" element={<PlannerPage />} />
        </Routes>

        <Toaster position="top-right" richColors closeButton duration={5000} />
      </div>
    </BrowserRouter>
  );
}

export default App;
