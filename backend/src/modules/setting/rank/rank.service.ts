import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRankDTO } from './dto/create_rank';
import { generateCode } from 'src/common/utils/generate-code.util';
import { RankFilterType } from './dto/filter_type';
import { RankPaginType } from './dto/pagin_type';
import { Prisma, Rank } from '@prisma/client';
import { UpdateRankDTO } from './dto/update_rank';
import { RANK_STATUS } from 'src/constant';

@Injectable()
export class RankService {
  constructor(private prismaService: PrismaService) {}

  private async generateNextRankCode(): Promise<string> {
    const lastR = await this.prismaService.rank.findFirst({
      where: {
        rank_code: {
          not: null,
          startsWith: 'RK_',
        },
      },
      orderBy: {
        rank_code: 'desc',
      },
      select: { rank_code: true },
    });

    let nextNumber = 1;
    if (lastR?.rank_code) {
      const match = lastR.rank_code.match(/^RK_(\d+)$/);
      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    return generateCode('RK', nextNumber);
  }

  async create(data: CreateRankDTO) {
    const { rank_code, ...rest } = data;

    // Retry to avoid collision when concurrent requests generate the same next code.
    for (let attempt = 0; attempt < 5; attempt++) {
      const rankCode = await this.generateNextRankCode();
      try {
        return await this.prismaService.rank.create({
          data: {
            ...rest,
            rank_code: rankCode,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }

    throw new HttpException('Could not generate a unique rank code. Please try again.', HttpStatus.CONFLICT);
  }
  async getAll(filter: RankFilterType): Promise<RankPaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const search = filter.search?.trim() || '';

    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

    const whereCondition = {
      is_active: true,
      OR: [
        { name_rank: { contains: search, mode: 'insensitive' as const } },
        { rank_code: { contains: search, mode: 'insensitive' as const } },
      ],
    };

    const [ranks, total_items] = await Promise.all([
      this.prismaService.rank.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        include: {
          rankUnit: {
            select: {
              id: true,
              full_name: true,
              acronym_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.rank.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: ranks,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }
  async getByID(id: string): Promise<Rank | null> {
    return this.prismaService.rank.findUnique({
      where: { id },
      include: {
        rankUnit: {
          select: {
            id: true,
            full_name: true,
            acronym_name: true,
          },
        },
      },
    });
    
  }
  async update(id: string, data: UpdateRankDTO): Promise<Rank> {
    const rank = await this.prismaService.rank.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!rank) {
      throw new NotFoundException('Rank not found');
    }
    const dataUpdate = { ...data };

        if (typeof dataUpdate.is_active === 'boolean') {
        dataUpdate.status = dataUpdate.is_active
      ? RANK_STATUS.ACTIVE
      : RANK_STATUS.INACTIVE;
        } else if (typeof dataUpdate.status === 'string') {
        dataUpdate.is_active =
      dataUpdate.status === RANK_STATUS.ACTIVE;
        }
    return this.prismaService.rank.update({
      where: { id },
      data: dataUpdate,
    });
  }
  async delete(id: string): Promise<Rank> {
    return this.prismaService.rank.update({
      where: { id },
      data: { is_active: false, status: RANK_STATUS.INACTIVE },
    });
  }
}
