import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Calendar, CalendarSchema } from './schemas/calendar.schema';
import { CalendarsService } from './calendars.service';
import { CalendarsController } from './calendars.controller';
import { HolidaysService } from './holidays.service';
import { OptimizerService } from './optimizer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Calendar.name, schema: CalendarSchema },
    ]),
  ],
  controllers: [CalendarsController],
  providers: [CalendarsService, HolidaysService, OptimizerService],
})
export class CalendarsModule {}
