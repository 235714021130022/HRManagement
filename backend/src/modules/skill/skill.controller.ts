import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Skill } from '@prisma/client';
import { SkillService } from './skill.service';
import { SkillFilterType } from './dto/filter_type';
import { SkillPaginType } from './dto/pagin_type';
import { CreateSkillDto } from './dto/create';
import { UpdateSkillDto } from './dto/update';

@Controller('skills')
export class SkillController {
  constructor(private readonly service: SkillService) {}

  @Post()
  create(@Body() body: CreateSkillDto): Promise<Skill> {
    return this.service.create(body);
  }

  @Get()
  getAll(
    @Query() params: SkillFilterType,
  ): Promise<SkillPaginType> {
    return this.service.getAll({
      ...params,
      pages: Number(params.pages) || 1,
      items_per_pages: Number(params.items_per_pages) || 10,
    });
  }

  @Get('tree')
  getTree() {
    return this.service.getTree();
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
  ): Promise<Skill | null> {
    return this.service.getById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateSkillDto,
  ): Promise<Skill> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<Skill> {
    return this.service.delete(id);
  }
}