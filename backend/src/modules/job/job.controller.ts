import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Job } from '@prisma/client';
import { CreateJobDto } from './dto/create';
import { JobFilterType } from './dto/filter_type';
import { JobPaginType } from './dto/pagin_type';
import { UpdateJobDto } from './dto/update';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly service: JobService) {}

  @Post()
  create(
    @Body() body: CreateJobDto,
  ): Promise<Job> {
    return this.service.create(body);
  }

  @Get()
  getAll(
    @Query() params: JobFilterType,
  ): Promise<JobPaginType> {
    return this.service.getAll({
      ...params,
      pages: Number(params.pages) || 1,
      items_per_pages: Number(params.items_per_pages) || 10,
    });
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
  ): Promise<Job | null> {
    return this.service.getById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
  ): Promise<Job | null> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<Job> {
    return this.service.delete(id);
  }
}