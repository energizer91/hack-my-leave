import { Injectable } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { VacationSuggestion } from './types';
import { formatName } from './utils/format-name';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

@Injectable()
export class OptimizerService {
  constructor(private readonly holidaysService: HolidaysService) {}

  async getOptimizedVacations(
    year: number,
    countryCode: string,
    vacationDays: number,
  ) {
    const holidays = await this.holidaysService.getPublicHolidays(
      year,
      countryCode,
    );

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
        .map((_, d) => day.subtract(d + 1, 'days'))
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

      let strong: dayjs.Dayjs[] = [];
      let weak: dayjs.Dayjs[] = [];

      if (possibleVacationsLeft.length && possibleVacationsRight.length) {
        if (possibleVacationsLeft.length <= possibleVacationsRight.length) {
          strong = possibleVacationsLeft;
          weak = possibleVacationsRight;
        } else {
          strong = possibleVacationsRight;
          weak = possibleVacationsLeft;
        }
      } else if (possibleVacationsLeft.length) {
        strong = possibleVacationsLeft;
      } else if (possibleVacationsRight.length) {
        strong = possibleVacationsRight;
      }

      const formattedStrongVacations = strong.map((d) =>
        d.format('YYYY-MM-DD'),
      );

      const formattedWeakVacations = weak.map((d) => d.format('YYYY-MM-DD'));

      formattedStrongVacations.forEach((d) => vacationsUsed.add(d));
      formattedWeakVacations.forEach((d) => vacationsUsed.add(d));

      // added guaranteed strong vacations
      suggestions.push({
        start: day.format('YYYY-MM-DD'),
        name: formatName(holiday),
        end: dayjs(formattedStrongVacations.at(-1)).format('YYYY-MM-DD'),
        power: 'strong',
        vacationUsed: formattedStrongVacations,
      });

      if (weak.length) {
        // added weak vacations which then can be filtered to match the vacation days count
        suggestions.push({
          start: day.format('YYYY-MM-DD'),
          name: formatName(holiday),
          end: dayjs(formattedWeakVacations.at(-1)).format('YYYY-MM-DD'),
          power: 'weak',
          vacationUsed: formattedWeakVacations,
        });
      }
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
