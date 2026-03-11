import { Controller } from '@nestjs/common';
import { Body, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create';
import { UpdateApplicationStatusDto } from './dto/update';
import { ApplicationFilterDto } from './dto/filter';
import { ApplicationPerformanceQueryDto } from './dto/performance-query';
import { ApplicationRejectedQueryDto } from './dto/rejected-query';
import { extractActorFromRequest } from 'src/common/utils/request-actor.util';
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(@Body() body: CreateApplicationDto, @Req() req: any) {
    const actor = extractActorFromRequest(req);
    return this.applicationService.create(body, actor);
  }

  @Get()
  findAll(@Query() query: ApplicationFilterDto) {
    return this.applicationService.findAll(query);
  }

  @Get('performance/summary')
  getPerformanceSummary(@Query() query: ApplicationPerformanceQueryDto) {
    return this.applicationService.getPerformanceSummary(query);
  }

  @Get('rejected/summary')
  getRejectedSummary(@Query() query: ApplicationRejectedQueryDto) {
    return this.applicationService.getRejectedSummary(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplicationStatusDto,
    @Req() req: any,
  ) {
    const actor = extractActorFromRequest(req);
    return this.applicationService.updateStatus(id, body, actor);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const actor = extractActorFromRequest(req);
    return this.applicationService.remove(id, actor);
  }
}