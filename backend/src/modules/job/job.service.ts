import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Job } from '@prisma/client';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { CreateJobDto } from './dto/create';
import { JobFilterType } from './dto/filter_type';
import { JobPaginType } from './dto/pagin_type';
import { UpdateJobDto } from './dto/update';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJobDto) {
    const { candidate_ids, job_code, ...rest } = data;

    let finalCode = job_code;

    if (!job_code) {
      const lastRecord = await this.prisma.job.findFirst({
        where: {
          job_code: {
            not: null,
            startsWith: 'JOB_',
          },
        },
        orderBy: { created_at: 'desc' },
        select: { job_code: true },
      });

      let nextNumber = 1;
      const last = lastRecord?.job_code;

      if (last) {
        const match = last.match(/^JOB_(\d+)$/);
        if (match) {
          nextNumber = Number(match[1]) + 1;
        }
      }

      finalCode = generateCode('JOB', nextNumber);
    }

    return this.prisma.job.create({
      data: {
        ...rest,
        job_code: finalCode,
        deadline: rest.deadline ? new Date(rest.deadline) : null,
        
        jobCandidates: candidate_ids
          ? {
              create: candidate_ids.map((id) => ({
                candidate_id: id,
              })),
            }
          : undefined,
      },
      include: {
        employee: true,
        jobCandidates: {
          include: { candidate: true },
        },
      },
    });
  }

  async getAll(params: JobFilterType): Promise<JobPaginType> {
    const {
      search,
      pages = 1,
      items_per_pages = 10,
    } = params;

    const skip = (pages - 1) * items_per_pages;

    const whereCondition: any = {
      is_active: true,
    };

    if (search) {
      whereCondition.OR = [
        {
          job_code: { contains: search, mode: 'insensitive' },
        },
        {
          name_job: { contains: search, mode: 'insensitive' },
        },
        {
          status: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const [data, total_items] = await Promise.all([
      this.prisma.job.findMany({
        where: whereCondition,
        skip,
        take: items_per_pages,
        orderBy: { created_at: 'desc' },
        include: {
          employee: true,
          jobCandidates: {
            include: { candidate: true },
          },
        },
      }),
      this.prisma.job.count({
        where: whereCondition,
      }),
    ]);

    return {
      data,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }
  async getById(id: string): Promise<Job | null> {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        employee: true,
        jobCandidates: {
          include: { candidate: true },
        },
      },
    });
  }
 async update(id: string, body: UpdateJobDto) {
  const { candidate_ids, ...rest } = body;

  return this.prisma.$transaction(async (tx) => {

    // 🔥 Kiểm tra tồn tại
    const job = await tx.job.findUnique({
      where: { id },
      select: { id: true, is_active: true, status: true },
    });

    if (!job) {
      throw new HttpException(
        'Công việc không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataUpdate: any = { ...rest };

    // 🔥 Logic đồng bộ status <-> is_active
    if (typeof dataUpdate.status === 'string') {
      if (dataUpdate.status === 'Inactive') {
        dataUpdate.is_active = false;
      }
      if (dataUpdate.status === 'Active') {
        dataUpdate.is_active = true;
      }
    }

    if (typeof dataUpdate.is_active === 'boolean') {
      dataUpdate.status = dataUpdate.is_active
        ? 'Active'
        : 'Inactive';
    }

    // 🔥 Update job chính
    await tx.job.update({
      where: { id },
      data: {
        ...dataUpdate,
        deadline: dataUpdate.deadline
          ? new Date(dataUpdate.deadline)
          : undefined,
        updated_at: new Date(),
      },
    });

    // 🔥 Update lại candidate nếu có
    if (candidate_ids) {
      await tx.job_Candidates.deleteMany({
        where: { job_id: id },
      });

      await tx.job_Candidates.createMany({
        data: candidate_ids.map((canId) => ({
          job_id: id,
          candidate_id: canId,
        })),
      });
    }

    return tx.job.findUnique({
      where: { id },
      include: {
        employee: true,
        jobCandidates: {
          include: { candidate: true },
        },
      },
    });
  });
}
  async delete(id: string): Promise<Job> {
    return this.prisma.job.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date()
      },
    });
  }
}