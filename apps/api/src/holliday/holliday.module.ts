import { Module } from '@nestjs/common';
import { HolidayController } from './holliday.controller';
import { HolidayRepository } from './holliday.repository';
import { HolidayService } from './holliday.service';

@Module({
  controllers: [HolidayController],
  providers: [HolidayService, HolidayRepository],
  exports: [HolidayRepository],
})
export class HolidayModule {}
