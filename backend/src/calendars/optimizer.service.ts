import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import { STRATEGY_TYPE, VacationSuggestion } from './types';
import Holidays from 'date-holidays';
import { randomUUID } from 'crypto';
import { strategies } from './utils/strategies';
import { rankVacationSegment } from './utils/rank-segment';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

@Injectable()
export class OptimizerService {
  getOptimizedVacations(
    year: number,
    countryCode: string,
    vacationDays: number,
    strategy = STRATEGY_TYPE.OPTIMAL,
  ) {
    const countryHolidays = new Holidays(countryCode);
    const holidays = countryHolidays
      .getHolidays(year)
      .filter((h) => ['public', 'bank', 'school'].includes(h.type));

    const suggestions: VacationSuggestion[] = [];
    const vacationsUsed = new Set<string>();
    const holidaysSet = new Set(
      holidays.map((h) => dayjs(h.date).format('YYYY-MM-DD')),
    );

    for (const holiday of holidays) {
      const day = dayjs(holiday.date);
      // if weekend - omit date
      if (day.day() === 0 || day.day() === 6) continue;

      // try to calculate to the closest weekend
      const left = day.diff(day.startOf('week'), 'days') - 1; // -sunday
      const right = day.endOf('week').diff(day, 'days') - 1; // -saturday

      const possibleVacationsLeft = Array.from({ length: left })
        .map((_, d) => day.startOf('week').add(d + 1, 'days'))
        .filter((d) => d.isSameOrAfter(day.startOf('year'), 'days')) // don't go before the current year
        .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
        .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

      const possibleVacationsRight = Array.from({ length: right })
        .map((_, d) => day.add(d + 1, 'days'))
        .filter((d) => d.isSameOrBefore(day.endOf('year'), 'days')) // don't go after the current year
        .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
        .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

      if (!possibleVacationsRight.length && !possibleVacationsLeft.length)
        continue;

      const vacationCandidates: dayjs.Dayjs[][] = [];

      if (possibleVacationsLeft.length)
        vacationCandidates.push(possibleVacationsLeft);

      if (possibleVacationsRight.length)
        vacationCandidates.push(possibleVacationsRight);

      // scores
      const withScores = vacationCandidates.map((vacationDays) => ({
        segments: vacationDays.map((d) => d.format('YYYY-MM-DD')),
        score: rankVacationSegment(vacationDays, holidaysSet),
      }));

      const totalVacations = withScores.reduce<string[]>(
        (acc, s) => acc.concat(s.segments),
        [],
      );

      if (totalVacations.length === 0) continue;

      totalVacations.forEach((d) => vacationsUsed.add(d));

      // added guaranteed strong vacations
      withScores.forEach((s) =>
        suggestions.push({
          id: randomUUID(),
          start: dayjs
            .min([holiday.date, ...s.segments].map((d) => dayjs(d)))!
            .format('YYYY-MM-DD'),
          end: dayjs
            .max([holiday.date, ...s.segments].map((d) => dayjs(d)))!
            .format('YYYY-MM-DD'),
          name: holiday.name,
          vacations: s.segments,
          score: s.score,
        }),
      );
    }

    // apply different strategies to reduce extra vacations
    const { result, remainingVacationDays } = strategies[strategy].apply(
      suggestions,
      vacationDays - vacationsUsed.size,
    );

    return {
      suggestions: result,
      remainingVacationDays,
    };
  }
}
