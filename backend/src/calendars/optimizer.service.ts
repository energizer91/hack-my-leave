import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import { STRATEGY_TYPE, VacationSuggestion } from './types';
import Holidays, { HolidaysTypes } from 'date-holidays';
import { randomUUID } from 'crypto';
import { strategies } from './utils/strategies';
import { AdvancedVacationRanker } from './utils/rank-segment';
import { bridgeVacations } from './utils/bridge-vacations';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

const HOLIDAYS_TO_EXCLUDE: HolidaysTypes.HolidayType[] = [
  'optional',
  'observance',
];

@Injectable()
export class OptimizerService {
  getOptimizedVacations(
    year: number,
    countryCode: string,
    vacationDays: number,
    strategy = STRATEGY_TYPE.OPTIMAL,
  ) {
    // 🎯 Шаг 1: Собираем праздники
    const holidays = this.collectHolidays(year, countryCode);

    // 🎯 Шаг 2: Генерируем все возможные предложения по отпускам
    const allSuggestions = this.generateVacationSuggestions(holidays);

    // 🎯 Шаг 3: Применяем стратегию для выбора оптимальных
    const selectedStrategy = strategies[strategy];
    const ranker = new AdvancedVacationRanker(selectedStrategy.rankingWeights);

    // Ранкуем все предложения
    const rankedSuggestions = allSuggestions.map((suggestion) => ({
      ...suggestion,
      score: ranker.rankVacationPeriod(suggestion),
    }));

    // Применяем стратегию
    const { result, remainingVacationDays } = selectedStrategy.apply(
      rankedSuggestions,
      vacationDays - this.getTotalVacationDaysCount(rankedSuggestions),
    );

    // Бриджим отпуска
    const { result: bridgedResult, remainingVacationDays: bridgedRemaining } =
      bridgeVacations(result, remainingVacationDays);

    return {
      suggestions: bridgedResult,
      holidays, // 📊 Возвращаем все праздники для справки
      remainingVacationDays: bridgedRemaining,
    };
  }

  /**
   * 🎯 Собираем и фильтруем праздники для года
   */
  private collectHolidays(year: number, countryCode: string) {
    const countryHolidays = new Holidays(countryCode);

    return countryHolidays
      .getHolidays(year)
      .filter((h) => !HOLIDAYS_TO_EXCLUDE.includes(h.type))
      .filter((h) => {
        const day = dayjs(h.date);
        // Пропускаем выходные
        return !(day.day() === 0 || day.day() === 6);
      })
      .map((h) => ({
        ...h,
        date: dayjs(h.date).format('YYYY-MM-DD'),
      }));
  }

  /**
   * 🎯 Генерируем ВСЕ возможные предложения по отпускам
   */
  private generateVacationSuggestions(holidays: HolidaysTypes.Holiday[]) {
    const suggestions: VacationSuggestion[] = [];
    const vacationsUsed = new Set<string>();
    const holidaysSet = new Set(
      holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD')),
    );

    for (const holiday of holidays) {
      const holidaySuggestions = this.generateSuggestionsForHoliday(
        holiday,
        holidaysSet,
        vacationsUsed,
      );

      suggestions.push(...holidaySuggestions);

      // Помечаем использованные дни отпуска
      holidaySuggestions.forEach((suggestion) => {
        suggestion.vacations.forEach((vacation) => {
          vacationsUsed.add(vacation);
        });
      });
    }

    return suggestions;
  }

  /**
   * 🎯 Генерируем предложения для конкретного праздника
   */
  private generateSuggestionsForHoliday(
    holiday: HolidaysTypes.Holiday,
    holidaysSet: Set<string>,
    vacationsUsed: Set<string>,
  ) {
    const day = dayjs(holiday.date);
    const suggestions: VacationSuggestion[] = [];

    // Рассчитываем дни до выходных
    const left = day.diff(day.startOf('week'), 'days') - 1; // -sunday
    const right = day.endOf('week').diff(day, 'days') - 1; // -saturday

    // Возможные отпуска слева (до праздника)
    const possibleVacationsLeft = Array.from({ length: left })
      .map((_, d) => day.startOf('week').add(d + 1, 'days'))
      .filter((d) => d.isSameOrAfter(day.startOf('year'), 'days'))
      .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
      .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

    // Возможные отпуска справа (после праздника)
    const possibleVacationsRight = Array.from({ length: right })
      .map((_, d) => day.add(d + 1, 'days'))
      .filter((d) => d.isSameOrBefore(day.endOf('year'), 'days'))
      .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
      .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

    // Создаем предложения
    const vacationCandidates: dayjs.Dayjs[][] = [];

    if (possibleVacationsLeft.length) {
      vacationCandidates.push(possibleVacationsLeft);
    }

    if (possibleVacationsRight.length) {
      vacationCandidates.push(possibleVacationsRight);
    }

    // Формируем финальные предложения
    vacationCandidates.forEach((vacationSegment) => {
      const suggestion: VacationSuggestion = {
        id: randomUUID(),
        name: holiday.name,
        date: dayjs(holiday.date).format('YYYY-MM-DD'),
        start: dayjs
          .min([holiday.date, ...vacationSegment].map(dayjs))!
          .format('YYYY-MM-DD'),
        end: dayjs
          .max([holiday.date, ...vacationSegment].map(dayjs))!
          .format('YYYY-MM-DD'),
        vacations: vacationSegment.map((d) => d.format('YYYY-MM-DD')),
        score: 0, // Будет проставлен позже через ranker
      };

      suggestions.push(suggestion);
    });

    return suggestions;
  }

  getStrategies() {
    return Object.entries(strategies).map(([key, value]) => ({
      label: value.name,
      value: key,
      tooltip: value.description,
    }));
  }

  // 🎯 Добавляем метод для подсчета
  private getTotalVacationDaysCount(suggestions: VacationSuggestion[]): number {
    const allDays = new Set<string>();
    suggestions.forEach((s) => s.vacations.forEach((day) => allDays.add(day)));
    return allDays.size;
  }
}
