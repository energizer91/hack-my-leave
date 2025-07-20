import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Calendar, CalendarDocument } from './schemas/calendar.schema';
import { Model } from 'mongoose';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
  ) {}

  async create(name: string, ownerId: string) {
    const calendar = new this.calendarModel({ name, owner: ownerId });
    return calendar.save();
  }

  async findByUser(userId: string) {
    return this.calendarModel.find({ owner: userId }).exec();
  }
}
