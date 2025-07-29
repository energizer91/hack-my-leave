import { Injectable } from '@nestjs/common';
import { Holiday } from './types';
import Holidays, { HolidaysTypes } from 'date-holidays';
import dayjs from 'dayjs';

const HOLIDAYS_TO_EXCLUDE: HolidaysTypes.HolidayType[] = [
  // 'optional',
  'observance',
];

@Injectable()
export class HolidaysService {
  getHolidays(
    year: number,
    countryCode: string,
    lang?: string,
    exclude = HOLIDAYS_TO_EXCLUDE,
  ) {
    return new Holidays(countryCode)
      .getHolidays(year, lang)
      .filter((h) => !exclude.includes(h.type))
      .map<Holiday>(({ date, start, end, name, type }) => ({
        name,
        start,
        end,
        type,
        date: dayjs(date).format('YYYY-MM-DD'),
      }));
  }

  getCountries(lang?: string) {
    return new Holidays().getCountries(lang);
  }
}
