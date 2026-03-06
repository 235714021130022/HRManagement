import { Module } from '@nestjs/common';
import { InterviewScheController } from './interview_sche.controller';
import { InterviewScheService } from './interview_sche.service';

@Module({
  controllers: [InterviewScheController],
  providers: [InterviewScheService]
})
export class InterviewScheModule {}
