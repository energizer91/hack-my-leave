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
  date: string;
  name: string;
  vacations: string[];
  score: number;
}

export interface StrategyResult {
  result: VacationSuggestion[];
  remainingVacationDays: number;
}

export enum STRATEGY_TYPE {
  OPTIMAL = 'OPTIMAL',
  AGGRESSIVE = 'AGGRESSIVE',
  SEASONAL = 'SEASONAL',
  STRAIGHT = 'STRAIGHT',
  BALANCED = 'BALANCED',
  SMART = 'SMART',
  LONG_VACATIONS = 'LONG_VACATIONS',
}

// Интерфейс для весов ранжирования
interface RankingWeights {
  efficiency: number;
  duration: number;
  seasonality: number;
  clustering: number;
  weekPosition: number;
  monthBalance: number;
  holidayProximity: number;
}

export interface Strategy {
  name: string;
  description: string;
  rankingWeights: RankingWeights;
  selectionPriority: 'score' | 'efficiency' | 'duration' | 'balanced' | 'smart';
  apply: (
    suggestions: VacationSuggestion[],
    vacationDays: number,
  ) => StrategyResult;
}
