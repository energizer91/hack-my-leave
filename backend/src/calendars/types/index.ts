export enum HOLIDAY_TYPES {
  PUBLIC = 'Public',
  BANK = 'Bank', // Bank holiday, banks and offices are closed
  SCHOOL = 'School', // School holiday, schools are closed
  AUTHORITIES = 'Authorities', // Authorities are closed
  OPTIONAL = 'Optional', // The majority of people take a day off
  OBSERVANCE = 'Observance', // Optional festivity, no paid day off
}

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: HOLIDAY_TYPES[];
}

export interface VacationSuggestion {
  id: string;
  start: string;
  end: string;
  name: string;
  vacations: string[];
  score: number;
}

export interface StrategyResult {
  result: VacationSuggestion[];
  remainingVacationDays: number;
}

export enum STRATEGY_TYPE {
  OPTIMAL,
  AGGRESSIVE,
  STRAIGHT,
}

export interface Strategy {
  name: string;
  description: string;
  apply: (
    suggestions: VacationSuggestion[],
    vacationDays: number,
  ) => StrategyResult;
}
