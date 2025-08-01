import type { HolidaysTypes } from 'date-holidays';

export interface VacationFormData {
  availableDays: number;
  year: number;
  strategy: string;
}

export interface VacationSuggestion {
  id: string;
  start: string;
  end: string;
  name: string;
  date: string;
  type: string;
  vacations: string[];
  score: number;
}

export interface VacationStrategy {
  label: string;
  value: string;
  tooltip: string;
}

export interface VacationResult {
  suggestions: VacationSuggestion[];
  holidays: HolidaysTypes.Holiday[];
  remainingVacationDays: number;
}
