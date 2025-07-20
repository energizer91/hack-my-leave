import { Injectable } from '@nestjs/common';
import { Holiday, HOLIDAY_TYPES } from './types';

@Injectable()
export class HolidaysService {
  async getPublicHolidays(
    year: number,
    country: string,
    types = [
      HOLIDAY_TYPES.PUBLIC,
      HOLIDAY_TYPES.BANK,
      HOLIDAY_TYPES.SCHOOL,
      HOLIDAY_TYPES.AUTHORITIES,
    ],
  ): Promise<Holiday[]> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status}`);
    }

    const data: Holiday[] = await response.json();

    return data.filter((h) =>
      h.types.some((t) => types.includes(t as HOLIDAY_TYPES)),
    );
  }
}
