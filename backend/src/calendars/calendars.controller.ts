import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { HolidaysService } from './holidays.service';
import { OptimizerService } from './optimizer.service';
import { STRATEGY_TYPE } from './types';

@Controller('calendars')
export class CalendarsController {
  constructor(
    private readonly calendarsService: CalendarsService,
    private readonly holidaysService: HolidaysService,
    private readonly optimizerService: OptimizerService,
  ) {}

  @Post()
  async create(@Body() body: { name: string; ownerId: string }) {
    return this.calendarsService.create(body.name, body.ownerId);
  }

  @Get()
  async getByUser(@Query('userId') userId: string) {
    return this.calendarsService.findByUser(userId);
  }

  @Get('holidays')
  async getHolidays(
    @Query('year') year: string,
    @Query('country') country: string,
  ) {
    const y = parseInt(year, 10);
    const countryCode = country?.toUpperCase();

    if (!y || !countryCode) {
      return { error: 'Missing or invalid year/country' };
    }

    return this.holidaysService.getPublicHolidays(y, countryCode);
  }

  @Get('optimize')
  optimize(
    @Query('year') year: string,
    @Query('country') country: string,
    @Query('days') days: string,
    @Query('strategy') strategy: STRATEGY_TYPE,
  ) {
    return this.optimizerService.getOptimizedVacations(
      parseInt(year, 10),
      country.toUpperCase(),
      parseInt(days, 10),
      strategy,
    );
  }
}
