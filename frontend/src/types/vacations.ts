export interface VacationFormData {
  availableDays: number;
  year: number;
  country: string;
}

export interface VacationSuggestion {
  start: string;
  end: string;
  name: string;
  power: 'strong' | 'weak';
  vacationUsed: string[];
}

export interface VacationResult {
  suggestions: VacationSuggestion[];
  remainingVacationDays: number;
}
