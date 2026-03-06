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
import { RankService } from './rank.service';
import { CreateRankDTO } from './dto/create_rank';
import { UpdateRankDTO } from './dto/update_rank';
import { RankFilterType } from './dto/filter_type';
import { RankPaginType } from './dto/pagin_type';
import { Rank } from '@prisma/client';

@Controller('rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Post()
  create(@Body() data: CreateRankDTO): Promise<Rank> {
    return this.rankService.create(data);
  }

  @Get()
  getAll(@Query() filter: RankFilterType): Promise<RankPaginType> {
    return this.rankService.getAll(filter);
  }

  @Get(':id')
  getByID(@Param('id') id: string): Promise<Rank | null> {
    return this.rankService.getByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateRankDTO
  ): Promise<Rank> {
    return this.rankService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Rank> {
    return this.rankService.delete(id);
  }
}