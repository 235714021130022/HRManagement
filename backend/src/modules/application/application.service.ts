import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { APPLICATION_STATUS } from 'src/constant';
import { PrismaService } from 'src/prisma.service';
import { AuditLogService, type CandidateAuditActor } from '../audit_log/audit_log.service';
import { CreateApplicationDto } from './dto/create';
import { UpdateApplicationStatusDto } from './dto/update';
@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(data: CreateApplicationDto, actor?: CandidateAuditActor) {
    const { candidate_id, recruitment_infor_id, note } = data;

    const [candidate, recruitment_infor, existed] = await Promise.all([
      this.prisma.candidate.findUnique({
        where: { id: candidate_id },
        select: {
          id: true,
          candidate_code: true,
          candidate_name: true,
        },
      }),
      this.prisma.recruitment_Infor.findUnique({
        where: { id: recruitment_infor_id },
        select: {
          id: true,
          recruitment_code: true,
          post_title: true,
          internal_title: true,
          is_active: true,
        },
      }),
      this.prisma.application.findUnique({
        where: {
          candidate_id_recruitment_infor_id: {
            candidate_id,
            recruitment_infor_id,
          },
        },
      }),
    ]);

    if (!candidate) {
      throw new NotFoundException('Ứng viên không tồn tại');
    }

    if (!recruitment_infor) {
      throw new NotFoundException('Tin tuyển dụng không tồn tại');
    }

    if (existed) {
      throw new BadRequestException(
        'Ứng viên đã được gán vào tin tuyển dụng này rồi',
      );
    }

    const created = await this.prisma.application.create({
      data: {
        candidate_id,
        recruitment_infor_id,
        status: APPLICATION_STATUS.APPLIED,
        note,
        
      },
      include: {
        candidate: {
          select: {
            id: true,
            candidate_code: true,
            candidate_name: true,
            phone_number: true,
            email: true,
          },
        },
        recruitment_infor: {
          select: {
            id: true,
            recruitment_code: true,
            internal_title: true,
            post_title: true,
            status: true,
            positionPost: {
              select: {
                id: true,
                name_post: true,
              },
            },
          },
        },
      },
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: candidate_id,
      action: 'APPLICATION_CREATED',
      message: 'Assigned candidate to recruitment application',
      metadata: {
        application_id: created.id,
        recruitment_infor_id,
        recruitment_post_title: recruitment_infor.post_title,
        recruitment_internal_title: recruitment_infor.internal_title,
      },
      ...actor,
    });

    return created;
  }

  async findAll(query?: {
    candidate_id?: string;
    recruitment_infor_id?: string;
    status?: string;
  }) {
    return this.prisma.application.findMany({
      where: {
        candidate_id: query?.candidate_id || undefined,
        recruitment_infor_id: query?.recruitment_infor_id || undefined,
        status: query?.status || undefined,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        candidate: {
          select: {
            id: true,
            candidate_code: true,
            candidate_name: true,
            phone_number: true,
            email: true,
          },
        },
        recruitment_infor: {
          select: {
            id: true,
            recruitment_code: true,
            internal_title: true,
            post_title: true,
            positionPost: {
              select: {
                id: true,
                name_post: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            candidate_code: true,
            candidate_name: true,
            phone_number: true,
            email: true,
          },
        },
        recruitment_infor: {
          select: {
            id: true,
            recruitment_code: true,
            internal_title: true,
            post_title: true,
            status: true,
            positionPost: {
              select: {
                id: true,
                name_post: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Application không tồn tại');
    }

    return item;
  }

  async updateStatus(id: string, data: UpdateApplicationStatusDto, actor?: CandidateAuditActor) {
    const existed = await this.prisma.application.findUnique({
      where: { id },
      select: { id: true, candidate_id: true, status: true, note: true },
    });

    if (!existed) {
      throw new NotFoundException('Application không tồn tại');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: data.status,
        note: data.note ?? existed.note,
      },
      include: {
        candidate: {
          select: {
            id: true,
            candidate_code: true,
            candidate_name: true,
          },
        },
        recruitment_infor: {
          select: {
            id: true,
            recruitment_code: true,
            post_title: true,
            internal_title: true,
            positionPost: {
              select: {
                id: true,
                name_post: true,
              },
            },
          },
        },
      },
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: existed.candidate_id,
      action: 'APPLICATION_STATUS_UPDATED',
      message: 'Updated application status',
      metadata: {
        application_id: id,
        from_status: existed.status,
        to_status: data.status,
        recruitment_post_title: updated.recruitment_infor?.post_title,
        recruitment_internal_title: updated.recruitment_infor?.internal_title,
      },
      ...actor,
    });

    return updated;
  }

  async remove(id: string, actor?: CandidateAuditActor) {
    const existed = await this.prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        candidate_id: true,
        recruitment_infor: {
          select: {
            id: true,
            post_title: true,
            internal_title: true,
          },
        },
      },
    });

    if (!existed) {
      throw new NotFoundException('Application không tồn tại');
    }

    const removed = await this.prisma.application.delete({
      where: { id },
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: existed.candidate_id,
      action: 'APPLICATION_DELETED',
      message: 'Removed candidate from recruitment application',
      metadata: {
        application_id: id,
        recruitment_infor_id: existed.recruitment_infor?.id,
        recruitment_post_title: existed.recruitment_infor?.post_title,
        recruitment_internal_title: existed.recruitment_infor?.internal_title,
      },
      ...actor,
    });

    return removed;
  }
}