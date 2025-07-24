import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/Header.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { PlannerPage } from '@/pages/PlannerPage.tsx';
import { CalendarPage } from '@/pages/CalendarPage.tsx';
import { run } from 'vanilla-cookieconsent';

import 'vanilla-cookieconsent/dist/cookieconsent.css';
import './index.css';

function App() {
  useEffect(() => {
    run({
      autoClearCookies: true,
      manageScriptTags: true,
      guiOptions: {
        consentModal: {
          layout: 'cloud inline',
          position: 'bottom center',
        },
        preferencesModal: {
          layout: 'box',
          position: 'left',
        },
      },
      categories: {
        necessary: {
          enabled: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [{ name: '_ga' }, { name: '_gid' }, { name: '_gat' }],
          },
          services: {
            ga4: {
              label: 'Google Analytics 4',
              cookies: [{ name: '_ga' }, { name: '_gid' }, { name: '_gat' }],
            },
          },
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies 🍪',
              description:
                'This site uses cookies to optimize your experience. You can accept all or adjust your preferences.',
              acceptAllBtn: 'Accept',
              acceptNecessaryBtn: 'Reject',
              showPreferencesBtn: 'Settings',
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Only necessary',
              savePreferencesBtn: 'Save settings',
              closeIconLabel: 'Close modal',
              sections: [
                {
                  title: 'Necessary cookies',
                  description:
                    'These cookies are essential for the website to function and cannot be disabled.',
                },
                {
                  title: 'Analytics cookies',
                  description:
                    'These cookies help us understand how users interact with the website by collecting anonymous data.',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

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
