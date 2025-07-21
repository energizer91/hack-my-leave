import { Injectable } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import minMax from 'dayjs/plugin/minMax';
import { VacationSuggestion } from './types';
import Holidays from 'date-holidays';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(minMax);

function rankVacationSegment(
  vacationDays: dayjs.Dayjs[],
  holidayDays: Set<string>,
): 'strong' | 'weak' {
  let score = 0;

  for (const d of vacationDays) {
    const prev = d.subtract(1, 'day').format('YYYY-MM-DD');
    const next = d.add(1, 'day').format('YYYY-MM-DD');
    const date = d.format('YYYY-MM-DD');

    const nearHoliday =
      holidayDays.has(prev) || holidayDays.has(next) || holidayDays.has(date);
    const nearWeekend = d.day() === 1 || d.day() === 5;

    if (nearHoliday) score += 2;
    else if (nearWeekend) score += 1;
    else score -= 1; // в центре недели, бесполезный
  }

  // Если в среднем хотя бы 1 балл на день — считаем отпуск ценным
  const avgScore = score / vacationDays.length;
  return avgScore >= 1 ? 'strong' : 'weak';
}

@Injectable()
export class OptimizerService {
  constructor(private readonly holidaysService: HolidaysService) {}

  async getOptimizedVacations(
    year: number,
    countryCode: string,
    vacationDays: number,
  ) {
    // produces more potential vacations
    const countryHolidays = new Holidays(countryCode);
    const holidays = countryHolidays.getHolidays(year);
    // const holidays = await this.holidaysService.getPublicHolidays(
    //   year,
    //   countryCode,
    // );

    const suggestions: VacationSuggestion[] = [];
    const vacationsUsed = new Set<string>();
    const holidaysSet = new Set(holidays.map((h) => h.date));

    for (const holiday of holidays) {
      const day = dayjs(holiday.date);
      // if weekend - omit date
      const isWorkingDay = day.day() >= 1 && day.day() <= 5;

      if (!isWorkingDay) continue;

      // try to calculate to the closest weekend
      // check end-of-year boundaries
      const startOfYear = day.startOf('year');
      const endOfYear = day.endOf('year');

      const left = day.diff(day.startOf('week'), 'days') - 1; // -sunday
      const right = day.endOf('week').diff(day, 'days') - 1; // -saturday

      const possibleVacationsLeft = Array.from({ length: left })
        .map((_, d) => day.startOf('week').add(d + 1, 'days'))
        .filter((d) => d.isSameOrAfter(startOfYear, 'days')) // don't go before the current year
        .filter((d) => !vacationsUsed.has(d.format('YYYY-MM-DD')))
        .filter((d) => !holidaysSet.has(d.format('YYYY-MM-DD')));

      const possibleVacationsRight = Array.from({ length: right })
        .map((_, d) => day.add(d + 1, 'days'))
        .filter((d) => d.isSameOrBefore(endOfYear, 'days')) // don't go after the current year
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
      const withScores = Object.fromEntries(
        vacationCandidates.map((vacationDays) => [
          rankVacationSegment(vacationDays, holidaysSet),
          vacationDays.map((d) => d.format('YYYY-MM-DD')),
        ]),
      ) as Record<'strong' | 'weak', string[]>;

      let formattedStrong = withScores.strong ?? [];
      let formattedWeak = withScores.weak ?? [];
      const totalVacations = formattedStrong.concat(formattedWeak);

      if (vacationsUsed.size + formattedWeak.length > vacationDays) {
        console.log('potentially more than possible weak');
        // formattedWeak = [];
      }

      if (vacationsUsed.size + formattedStrong.length > vacationDays) {
        console.log('potentially more than possible strong');
        // formattedStrong = [];
      }

      if (formattedWeak.length + formattedStrong.length === 0) continue;

      totalVacations.forEach((d) => vacationsUsed.add(d));

      const allDays = [holiday.date, ...totalVacations].map((d) => dayjs(d));
      const vacationDaysUsed = totalVacations.length;
      const allCalendarDays =
        dayjs.max(allDays)!.diff(dayjs.min(allDays)!, 'days') + 1;
      const efficiency =
        vacationDaysUsed > 0 ? allCalendarDays / vacationDaysUsed : 0;

      // added guaranteed strong vacations
      suggestions.push({
        start: dayjs.min(allDays)!.format('YYYY-MM-DD'),
        end: dayjs.max(allDays)!.format('YYYY-MM-DD'),
        name: holiday.name,
        classifiedVacations: {
          strong: formattedStrong,
          weak: formattedWeak,
        },
        efficiency,
        vacationUsed: totalVacations,
      });
    }

    const remainingVacationDays = vacationDays - vacationsUsed.size;

    if (remainingVacationDays < 0) {
      console.log('need to reduce vacations');
    }

    return {
      suggestions,
      remainingVacationDays,
    };
  }
}
