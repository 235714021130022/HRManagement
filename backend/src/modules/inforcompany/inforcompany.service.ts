import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateInforCompanyDTO } from './dto/created_inforcom';
import { InforCompany } from '@prisma/client';
import { InformCompanyFilterType } from './dto/inforcom_filter_type';
import { InformCompanyPaginType } from './dto/inforcom_pagin_type';
import { UpdateInforCompanyDTO } from './dto/updated_inforcom';
import { generateCode } from 'src/common/utils/generate-code.util';

@Injectable()
export class InforcompanyService {
    constructor(private prismaService: PrismaService){}
    async createInfor(data: CreateInforCompanyDTO): Promise<InforCompany> {
  const { infor_code, date_stablish, date_of_issue, ...rest } = data;

  const lastInfor = await this.prismaService.inforCompany.findFirst({
    where: {
      infor_code: { not: null, startsWith: 'IC_' },
    },
    orderBy: { infor_code: 'desc' },
    select: { infor_code: true },
  });

  let nextNumber = 1;
  const last = lastInfor?.infor_code;
  if (last) {
    const m = last.match(/^IC_(\d+)$/);
    if (m) nextNumber = Number(m[1]) + 1;
  }

  const inforCode = generateCode('IC', nextNumber);

  return this.prismaService.inforCompany.create({
    data: {
      ...rest,
      infor_code: inforCode,
      date_of_issue: date_of_issue ? new Date(date_of_issue) : undefined,
      date_stablish: date_stablish ? new Date(date_stablish) : undefined,
    },
  });
}

    async getAll(filter: InformCompanyFilterType): Promise<InformCompanyPaginType>{
        const item_per_page = Number(filter.items_per_page) || 10;
        const page = Number(filter.page) || 1;
        const search = filter.search ? filter.search.trim() : '';

        const skip = page > 1 ? (page - 1) * item_per_page : 0;
        const company = await this.prismaService.inforCompany.findMany({
            take: item_per_page,
            skip,
            where: {
                is_active: true,
                OR: [
                    {
                        full_name: { contains: search, mode: 'insensitive'}
                    },
                    {
                        acronym_name: { contains: search, mode: 'insensitive'}
                    }

                ],
                AND: [
                    {
                        status: {not: 'Inactive'}
                    }
                ]
            },
            orderBy: {
                created_at: 'desc'
            }
        })
        const total_items = await this.prismaService.inforCompany.count({
            where: {
                OR: [
                    {
                        full_name: { contains: search, mode: 'insensitive'}
                    },
                    {
                        acronym_name: { contains: search, mode: 'insensitive'}
                    }

                ],
                AND: [
                    {
                        status: {not: 'Inactive'}
                    }
                ]
            }
        })
        return {
            data: company,
            total_items,
            current_page: page,
            item_per_page
        }
    } 
    async getByID(id: string): Promise<InforCompany| null>{
        return this.prismaService.inforCompany.findFirst({
            where: { id }
        })
    }
    async updateInform (id: string, data: UpdateInforCompanyDTO): Promise<InforCompany>{
        const { date_stablish, date_of_issue, ...rest} = data;
        return await this.prismaService.inforCompany.update({
            where: {id},
            data: {
                ...rest,
                date_of_issue: date_of_issue ? new Date(date_of_issue) : undefined,
                date_stablish: date_stablish ? new Date(date_stablish) : undefined,
            }
        })
    }
    async deleteInform (id: string): Promise<InforCompany>{
        return await this.prismaService.inforCompany.update({
            where: {id},
            data: {is_active: false, status: 'Inactive'}
        })
    }
}
