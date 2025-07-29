import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import { Holiday, STRATEGY_TYPE, VacationSuggestion } from './types';
import { randomUUID } from 'crypto';
import { getTotalVacationDaysCount, strategies } from './utils/strategies';
import { AdvancedVacationRanker } from './utils/rank-segment';
import { bridgeVacations } from './utils/bridge-vacations';
import { HolidaysService } from './holidays.service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

@Injectable()
export class OptimizerService {
  constructor(private readonly holidayService: HolidaysService) {}

  getOptimizedVacations(
    year: number,
    countryCode: string,
    vacationDays: number,
    strategy = STRATEGY_TYPE.OPTIMAL,
    skipPast = true,
    lang?: string,
  ) {
    // 🎯 Шаг 1: Собираем праздники
    const holidays = this.collectHolidays(year, countryCode, lang);

    // 🎯 Шаг 2: Генерируем все возможные предложения по отпускам
    const allSuggestions = this.generateVacationSuggestions(holidays, skipPast);

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
      vacationDays - getTotalVacationDaysCount(rankedSuggestions),
    );

    // Бриджим отпуска
    const { result: bridgedResult, remainingVacationDays: bridgedRemaining } =
      bridgeVacations(result, remainingVacationDays);

    return {
      suggestions: bridgedResult,
      holidays,
      remainingVacationDays: bridgedRemaining,
    };
  }

  /**
   * 🎯 Собираем и фильтруем праздники для года
   */
  public collectHolidays(year: number, countryCode: string, lang?: string) {
    return this.holidayService
      .getHolidays(year, countryCode, lang)
      .filter((h) => {
        const day = dayjs(h.date);
        // Пропускаем выходные
        return !(day.day() === 0 || day.day() === 6);
      });
  }

  /**
   * 🎯 Генерируем ВСЕ возможные предложения по отпускам
   */
  private generateVacationSuggestions(holidays: Holiday[], skipCurrent = true) {
    const suggestions: VacationSuggestion[] = [];
    const vacationsUsed = new Set<string>();
    const today = dayjs();
    const holidaysSet = new Set(
      holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD')),
    );
    const actualHolidays = skipCurrent
      ? holidays.filter((h) => dayjs(h.date).isSameOrAfter(today, 'day'))
      : holidays;

    for (const holiday of actualHolidays) {
      const holidaySuggestions = this.generateSuggestionsForHoliday(
        holiday,
        holidaysSet,
        vacationsUsed,
      );

      suggestions.push(...holidaySuggestions);

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
    holiday: Holiday,
    holidaysSet: Set<string>,
    vacationsUsed: Set<string>,
  ) {
    const day = dayjs(holiday.date);
    const suggestions: VacationSuggestion[] = [];
    const left = day.diff(day.startOf('week'), 'days') - 1; // -sunday
    const right = day.endOf('week').diff(day, 'days') - 1; // -saturday
    const possibleVacationsLeft = Array.from({ length: left })
      .map((_, d) => day.startOf('week').add(d + 1, 'days'))
      .filter((d) => d.isSameOrAfter(day.startOf('year'), 'days'))
      .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
      .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));
    const possibleVacationsRight = Array.from({ length: right })
      .map((_, d) => day.add(d + 1, 'days'))
      .filter((d) => d.isSameOrBefore(day.endOf('year'), 'days'))
      .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
      .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

    const vacationCandidates: dayjs.Dayjs[][] = [];

    if (possibleVacationsLeft.length) {
      vacationCandidates.push(possibleVacationsLeft);
    }

    if (possibleVacationsRight.length) {
      vacationCandidates.push(possibleVacationsRight);
    }

    vacationCandidates.forEach((vacationSegment) => {
      const suggestion: VacationSuggestion = {
        id: randomUUID(),
        name: holiday.name,
        type: holiday.type,
        date: dayjs(holiday.date).format('YYYY-MM-DD'),
        start: dayjs
          .min([holiday.date, ...vacationSegment].map(dayjs))!
          .format('YYYY-MM-DD'),
        end: dayjs
          .max([holiday.date, ...vacationSegment].map(dayjs))!
          .format('YYYY-MM-DD'),
        vacations: vacationSegment.map((d) => d.format('YYYY-MM-DD')),
        score: 0,
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
}
