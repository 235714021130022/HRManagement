import { Injectable, NotFoundException } from '@nestjs/common';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { CreateTypeSchedulesLinkDto } from './dto/create';
import { TypeSchedulesLinkFilterType } from './dto/filter_type';
import { TypeSchedulesLinkPaginType } from './dto/pagin_type';
import { UpdateTypeSchedulesLinkDto } from './dto/update';
@Injectable()
export class TypescheLinkService {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateTypeSchedulesLinkDto) {
    const { ...rest } = data;

    const lastLink =
      await this.prismaService.typeSchedules_Link.findFirst({
        where: {
          tl_code: {
            not: null,
            startsWith: 'TL_',
          },
        },
        orderBy: {
          tl_code: 'desc',
        },
        select: { tl_code: true },
      });

    let nextNumber = 1;
    const last = lastLink?.tl_code;

    if (last) {
      const match = last.match(/^TL_(\d+)$/);
      if (match) nextNumber = Number(match[1]) + 1;
    }

    const linkCode = generateCode('TL', nextNumber);

    return this.prismaService.typeSchedules_Link.create({
      data: {
        ...rest,
        tl_code: linkCode,
      },
    });
  }

  async getAll(
    filter: TypeSchedulesLinkFilterType,
  ): Promise<TypeSchedulesLinkPaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const search = filter.search ? filter.search.trim() : '';

    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

    const whereCondition = {
      is_active: true,
      OR: [
        {
          tl_code: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          exam_link: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [links, total_items] = await Promise.all([
      this.prismaService.typeSchedules_Link.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        include: {
          scheduleType: true,
        },
      }),
      this.prismaService.typeSchedules_Link.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: links,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }

  async getByID(id: string) {
    const link = await this.prismaService.typeSchedules_Link.findUnique({
      where: { id },
      include: { scheduleType: true },
    });

    if (!link) {
      throw new NotFoundException('Type schedules link not found');
    }

    return link;
  }

  async update(id: string, data: UpdateTypeSchedulesLinkDto) {
    const link = await this.prismaService.typeSchedules_Link.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!link) {
      throw new NotFoundException('Type schedules link not found');
    }

    return this.prismaService.typeSchedules_Link.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async delete(id: string) {
    const link = await this.prismaService.typeSchedules_Link.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!link) {
      throw new NotFoundException('Type schedules link not found');
    }

    return this.prismaService.typeSchedules_Link.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }
}