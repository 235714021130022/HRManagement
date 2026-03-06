import { Injectable } from '@nestjs/common';
import { Interview_Schedule } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateInterviewScheduleDto } from './dto/create';
import { UpdateInterviewScheduleDto } from './dto/update';
import { InterviewFilterType } from './dto/filter_type';
import { InterviewPaginType } from './dto/pagin_type';
import { generateCode } from 'src/common/utils/generate-code.util';

@Injectable()
export class InterviewScheService {
  constructor(private prisma: PrismaService) {}

async create(
  data: CreateInterviewScheduleDto,
) {
  const {
    sche_code,
    interviewer_ids,
    candidate_ids,
    ...rest
  } = data;

  let finalCode = sche_code;

  if (!sche_code) {
    const lastRecord = await this.prisma.interview_Schedule.findFirst({
      where: {
        sche_code: {
          not: null,
          startsWith: 'INT_',
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      select: { sche_code: true },
    });

    let nextNumber = 1;
    const last = lastRecord?.sche_code;

    if (last) {
      const match = last.match(/^INT_(\d+)$/);
      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    finalCode = generateCode('INT', nextNumber);
  }

  return this.prisma.interview_Schedule.create({
    data: {
      ...rest,
      sche_code: finalCode,
      interview_date: rest.interview_date
        ? new Date(rest.interview_date)
        : null,
      times: rest.times ? new Date(rest.times) : null,

      // 🔥 nested create
      interviewers: interviewer_ids
        ? {
            create: interviewer_ids.map((id) => ({
              employee_id: id,
            })),
          }
        : undefined,

      candidates: candidate_ids
        ? {
            create: candidate_ids.map((id) => ({
              candidate_id: id,
            })),
          }
        : undefined,
    },
    include: {
      interviewers: {
        include: { interviewer: true },
      },
      candidates: {
        include: { candidate: true },
      },
    },
  });
}

  async getAll(params: InterviewFilterType): Promise<InterviewPaginType> {
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
        sche_code: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        interview_location: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        interview_room: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [data, total_items] = await Promise.all([
    this.prisma.interview_Schedule.findMany({
      where: whereCondition,
      skip,
      take: items_per_pages,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        scheduleType: true,
        interviewers: {
            include: {
                interviewer: true,
            },
            },
            candidates: {
            include: {
                candidate: true,
            },
            },
      },
    }),
    this.prisma.interview_Schedule.count({
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

  async getById(id: string): Promise<Interview_Schedule | null> {
    return this.prisma.interview_Schedule.findUnique({
      where: { id },
      include: {
        scheduleType: true,
        interviewers: true,
        candidates: true,
      },
    });
  }

  async update(
  id: string,
  body: UpdateInterviewScheduleDto,
) {
  const {
    interviewer_ids,
    candidate_ids,
    ...rest
  } = body;

  return this.prisma.$transaction(async (tx) => {

  await tx.interview_Schedule.update({
    where: { id },
    data: {
      ...rest,
      interview_date: rest.interview_date
        ? new Date(rest.interview_date)
        : undefined,
      times: rest.times
        ? new Date(rest.times)
        : undefined,
      updated_at: new Date(),
    },
  });

  if (interviewer_ids) {
    await tx.schedule_Interviewers.deleteMany({
      where: { interview_schedule_id: id },
    });

    await tx.schedule_Interviewers.createMany({
      data: interviewer_ids.map((empId) => ({
        interview_schedule_id: id,
        employee_id: empId,
      })),
    });
  }

  if (candidate_ids) {
    await tx.schedules_Candidates.deleteMany({
      where: { interview_schedule_id: id },
    });

    await tx.schedules_Candidates.createMany({
      data: candidate_ids.map((canId) => ({
        interview_schedule_id: id,
        candidate_id: canId,
      })),
    });
  }

  return tx.interview_Schedule.findUnique({
    where: { id },
    include: {
      interviewers: { include: { interviewer: true } },
      candidates: { include: { candidate: true } },
    },
  });
});
}

  async delete(id: string): Promise<Interview_Schedule> {
    return this.prisma.interview_Schedule.update({
      where: { id },
      data: {
        is_active: false,
      },
    });
  }
}