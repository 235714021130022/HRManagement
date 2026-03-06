import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Interview_Schedule } from '@prisma/client';
import { CreateInterviewScheduleDto } from './dto/create';
import { InterviewFilterType } from './dto/filter_type';
import { InterviewPaginType } from './dto/pagin_type';
import { UpdateInterviewScheduleDto } from './dto/update';
import { InterviewScheService } from './interview_sche.service';

@Controller('interview-sche')
export class InterviewScheController {
  constructor(private readonly service: InterviewScheService) {}

  @Post()
  create(
    @Body() body: CreateInterviewScheduleDto,
  ): Promise<Interview_Schedule> {
    return this.service.create(body);
  }

  @Get()
  getAll(
    @Query() params: InterviewFilterType,
  ): Promise<InterviewPaginType> {
    return this.service.getAll({
      ...params,
      pages: Number(params.pages) || 1,
      items_per_pages: Number(params.items_per_pages) || 10,
    });
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
  ): Promise<Interview_Schedule | null > {
    return this.service.getById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateInterviewScheduleDto,
  ): Promise<Interview_Schedule | null> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<Interview_Schedule> {
    return this.service.delete(id);
  }
}