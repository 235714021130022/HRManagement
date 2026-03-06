
import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  Query 
} from '@nestjs/common';
import { Schedules_Type } from '@prisma/client';
import { CreateSchedulesTypeDto } from './dto/create';
import { SchedulesTypeFilterType } from './dto/filter_type';
import { SchedulesTypePaginType } from './dto/pagin_type';
import { UpdateSchedulesTypeDto } from './dto/update';
import { TypeScheService } from './type_sche.service';

@Controller('type-sche')
export class TypeScheController {
  constructor(private schedulesTypeService: TypeScheService) {}

  @Post()
  create(
    @Body() body: CreateSchedulesTypeDto,
  ): Promise<Schedules_Type> {
    return this.schedulesTypeService.create(body);
  }

  @Get()
  getAll(
    @Query() params: SchedulesTypeFilterType,
  ): Promise<SchedulesTypePaginType> {
    return this.schedulesTypeService.getAll(params);
  }

  @Get(':id')
  getByID(
    @Param('id') id: string,
  ): Promise<Schedules_Type | null> {
    return this.schedulesTypeService.getByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateSchedulesTypeDto,
  ): Promise<Schedules_Type> {
    return this.schedulesTypeService.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<Schedules_Type> {
    return this.schedulesTypeService.delete(id);
  }
}