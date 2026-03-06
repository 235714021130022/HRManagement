import { Injectable, NotFoundException } from '@nestjs/common';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { CreateSchedulesTypeDto } from './dto/create';
import { SchedulesTypeFilterType } from './dto/filter_type';
import { SchedulesTypePaginType } from './dto/pagin_type';
import { UpdateSchedulesTypeDto } from './dto/update';

@Injectable()
export class TypeScheService {
  constructor(private prismaService: PrismaService) {}

  // ======================= CREATE =======================
  async create(data: CreateSchedulesTypeDto) {
    const { st_code, ...rest } = data;

    const lastType =
      await this.prismaService.schedules_Type.findFirst({
        where: {
          st_code: {
            not: null,
            startsWith: 'ST_',
          },
        },
        orderBy: {
          st_code: 'desc',
        },
        select: { st_code: true },
      });

    let nextNumber = 1;
    const last = lastType?.st_code;

    if (last) {
      const match = last.match(/^ST_(\d+)$/);
      if (match) nextNumber = Number(match[1]) + 1;
    }

    const scheduleCode = generateCode('ST', nextNumber);

    return this.prismaService.schedules_Type.create({
      data: {
        ...rest,
        st_code: scheduleCode,
      },
    });
  }

  async getAll(
    filter: SchedulesTypeFilterType,
  ): Promise<SchedulesTypePaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const search = filter.search ? filter.search.trim() : '';

    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

    const whereCondition = {
      is_active: true,
      OR: [
        {
          type_name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          st_code: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [types, total_items] = await Promise.all([
      this.prismaService.schedules_Type.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.schedules_Type.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: types,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }

  async getByID(id: string) {
    const type = await this.prismaService.schedules_Type.findUnique({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Schedules type not found');
    }

    return type;
  }

  async update(id: string, data: UpdateSchedulesTypeDto) {
    const type = await this.prismaService.schedules_Type.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!type) {
      throw new NotFoundException('Schedules type not found');
    }

    return this.prismaService.schedules_Type.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async delete(id: string) {
    const type = await this.prismaService.schedules_Type.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!type) {
      throw new NotFoundException('Schedules type not found');
    }

    return this.prismaService.schedules_Type.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }
}