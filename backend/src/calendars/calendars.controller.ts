import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { HolidaysService } from './holidays.service';
import { OptimizerService } from './optimizer.service';
import { STRATEGY_TYPE } from './types';
import { Lang } from 'src/common/lang.decorator';

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
  getHolidays(
    @Lang() language: string,
    @Query('year') year: string,
    @Query('country') country: string,
  ) {
    const y = parseInt(year, 10);
    const countryCode = country?.toUpperCase();

    if (!y || !countryCode) {
      throw new HttpException(
        'Missing or invalid year/country',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.optimizerService.getHolidays(y, countryCode, language);
  }

  @Get('optimize')
  optimize(
    @Lang() language: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('country') country: string,
    @Query('days', ParseIntPipe) days: number,
    @Query('strategy') strategy = STRATEGY_TYPE.OPTIMAL,
  ) {
    if (!country) {
      throw new HttpException('Missing country code', HttpStatus.BAD_REQUEST);
    }

    if (!(strategy in STRATEGY_TYPE)) {
      throw new HttpException('Invalid strategy', HttpStatus.BAD_REQUEST);
    }

    return this.optimizerService.getOptimizedVacations(
      year,
      country.toUpperCase(),
      days,
      strategy,
      language,
    );
  }

  @Get('strategies')
  strategies() {
    return this.optimizerService.getStrategies();
  }

  @Get('countries')
  countries(@Lang() language: string) {
    return this.optimizerService.getCountries(language);
  }
}
