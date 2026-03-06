import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCompanyRegistrationDto } from './dto/create';
import { CompanyRegistrationFilterType } from './dto/filter_type';
import { CompanyRegistrationPaginType } from './dto/pagin_type';
import { UpdateCompanyRegistrationDto } from './dto/update';
import { generateCode } from 'src/common/utils/generate-code.util';
@Injectable()
export class CompanyRegisterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyRegistrationDto) {
    return this.prisma.companyRegistrationRequest.create({
      data,
      include: { createdBy: true, inforCompany: true },
    });
  }

  async getAll(filter: CompanyRegistrationFilterType): Promise<CompanyRegistrationPaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;
    const search = filter.search?.trim() || '';

    const whereCondition: any = {
      OR: [
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    };

    if (filter.status) {
      whereCondition.status = filter.status;
    }

    const [registrations, total_items] = await Promise.all([
      this.prisma.companyRegistrationRequest.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true, inforCompany: true },
      }),
      this.prisma.companyRegistrationRequest.count({ where: whereCondition }),
    ]);

    return { data: registrations, current_pages: pages, items_per_pages, total_items };
  }

  async getByID(id: string) {
    const record = await this.prisma.companyRegistrationRequest.findUnique({
      where: { id },
      include: { createdBy: true, inforCompany: true },
    });
    if (!record) throw new NotFoundException('Company registration not found');
    return record;
  }

async approveRegistration(id: string) {
  const record = await this.prisma.companyRegistrationRequest.findUnique({
    where: { id },
  });
  if (!record) throw new NotFoundException('Company registration not found');

  const lastInfor = await this.prisma.inforCompany.findFirst({
    where: { infor_code: { not: null, startsWith: 'IC_' } },
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

  const inforCompany = await this.prisma.inforCompany.create({
    data: {
      full_name: record.companyName,
      email: record.email,
      phone_number: record.phone,
      address: record.address,
      status: 'Active',
      infor_code: inforCode,
    },
  });

  await this.prisma.companyRegistrationRequest.update({
    where: { id },
    data: {
      status: 'approved',
      inforCompanyId: inforCompany.id,
      approvedAt: new Date(),
    },
  });

  return inforCompany; // trả về công ty chính thức
}

async update(id: string, data: UpdateCompanyRegistrationDto) {
  const record = await this.prisma.companyRegistrationRequest.findUnique({
    where: { id },
  });
  if (!record) throw new NotFoundException('Company registration not found');

  if (data.status === 'approved') {
    return this.approveRegistration(id);
  }

  return this.prisma.companyRegistrationRequest.update({
    where: { id },
    data,
    include: { createdBy: true, inforCompany: true },
  });
}

  async delete(id: string) {
    const record = await this.prisma.companyRegistrationRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Company registration not found');

    return this.prisma.companyRegistrationRequest.update({
      where: { id },
      data: {is_active: false}
    });
  }
}