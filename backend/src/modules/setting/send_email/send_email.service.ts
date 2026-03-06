import { Injectable, NotFoundException } from '@nestjs/common';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { SettingEmailOtherFilterType } from './dto/filter_type';
import { SettingEmailOtherPaginType } from './dto/pagin_type';
import { UpdateSettingEmailOtherDto } from './dto/update';
import { CreateSettingEmailOtherDto } from './dto/create';
@Injectable()
export class SendEmailService {
  constructor(private prismaService: PrismaService) {}

  // ================= CREATE =================
  async create(data: CreateSettingEmailOtherDto) {
    const { sec_code, unit_id, ...rest } = data;
    if (unit_id) {
      const unit = await this.prismaService.inforCompany.findUnique({
        where: { id: unit_id },
        select: { id: true },
      });

      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
    }
    const lastEmail =
      await this.prismaService.settingEmail.findFirst({
        where: {
          sec_code: {
            not: null,
            startsWith: 'SE_',
          },
        },
        orderBy: { sec_code: 'desc' },
        select: { sec_code: true },
      });

    let nextNumber = 1;
    const last = lastEmail?.sec_code;

    if (last) {
      const match = last.match(/^SE_(\d+)$/);
      if (match) nextNumber = Number(match[1]) + 1;
    }

    const secCode = sec_code
      ? sec_code
      : generateCode('SE', nextNumber);

    return this.prismaService.settingEmail.create({
      data: {
        ...rest,
        sec_code: secCode,
        unit_id,
      },
    });
  }

  async getAll(
    filter: SettingEmailOtherFilterType,
  ): Promise<SettingEmailOtherPaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const search = filter.search ? filter.search.trim() : '';
    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

    const whereCondition = {
      is_active: true,
      OR: [
        {
          email_name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          sec_code: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          email_subject: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [emails, total_items] = await Promise.all([
      this.prismaService.settingEmail.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        include: {
          inforCompany: true,
        },
      }),
      this.prismaService.settingEmail.count({
        where: whereCondition,
      }),
    ]);

    return {
      data: emails,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }

  async getByID(id: string) {
    const email = await this.prismaService.settingEmail.findUnique({
      where: { id },
      include: { inforCompany: true },
    });

    if (!email) {
      throw new NotFoundException('Email setting not found');
    }

    return email;
  }

  async update(
    id: string,
    data: UpdateSettingEmailOtherDto,
  ) {
    const email = await this.prismaService.settingEmail.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!email) {
      throw new NotFoundException('Email setting not found');
    }

    if (data.unit_id) {
      const unit = await this.prismaService.inforCompany.findUnique({
        where: { id: data.unit_id },
        select: { id: true },
      });

      if (!unit) {
        throw new NotFoundException('Unit not found');
      }
    }

    return this.prismaService.settingEmail.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  // ================= SOFT DELETE =================
  async delete(id: string) {
    const email = await this.prismaService.settingEmail.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!email) {
      throw new NotFoundException('Email setting not found');
    }

    return this.prismaService.settingEmail.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }
}