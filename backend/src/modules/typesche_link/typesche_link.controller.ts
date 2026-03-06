import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TypeSchedules_Link } from '@prisma/client';
import { CreateTypeSchedulesLinkDto } from './dto/create';
import { TypeSchedulesLinkFilterType } from './dto/filter_type';
import { TypeSchedulesLinkPaginType } from './dto/pagin_type';
import { UpdateTypeSchedulesLinkDto } from './dto/update';
import { TypescheLinkService } from './typesche_link.service';

@Controller('typesche-link')
export class TypescheLinkController {
  constructor(private typeSchedulesLinkService: TypescheLinkService) {}

  @Post()
  create(
    @Body() body: CreateTypeSchedulesLinkDto,
  ): Promise<TypeSchedules_Link> {
    return this.typeSchedulesLinkService.create(body);
  }

  @Get()
  getAll(
    @Query() params: TypeSchedulesLinkFilterType,
  ): Promise<TypeSchedulesLinkPaginType> {
    return this.typeSchedulesLinkService.getAll(params);
  }

  @Get(':id')
  getByID(
    @Param('id') id: string,
  ): Promise<TypeSchedules_Link | null> {
    return this.typeSchedulesLinkService.getByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTypeSchedulesLinkDto,
  ): Promise<TypeSchedules_Link> {
    return this.typeSchedulesLinkService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<TypeSchedules_Link> {
    return this.typeSchedulesLinkService.delete(id);
  }
}