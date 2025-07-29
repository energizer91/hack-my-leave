import { HolidaysTypes } from 'date-holidays';

export type Holiday = Pick<
  HolidaysTypes.Holiday,
  'date' | 'start' | 'end' | 'name' | 'type'
>;

export interface VacationSuggestion {
  id: string;
  start: string;
  end: string;
  date: string;
  name: string;
  type: HolidaysTypes.HolidayType;
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
export interface RankingWeights {
  // соотношение выходных к отпускным дням
  efficiency: number;
  // длительность отпуска
  duration: number;
  // сезонность (лето/зима)
  seasonality: number;
  // компактность дат
  clustering: number;
  // позиция в неделе
  weekPosition: number;
  // равномерность по месяцам
  monthBalance: number;
  // близость к праздникам
  holidayProximity: number;
  // тип праздника
  type: number;
}

export enum SELECTION_PRIORITY {
  SCORE,
  EFFICIENCY,
  DURATION,
  BALANCED,
  SMART,
}

export interface Strategy {
  name: string;
  description: string;
  rankingWeights: RankingWeights;
  apply: (
    suggestions: VacationSuggestion[],
    vacationDays: number,
  ) => StrategyResult;
}
