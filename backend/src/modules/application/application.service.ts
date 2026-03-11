import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { APPLICATION_STATUS } from 'src/constant';
import { PrismaService } from 'src/prisma.service';
import { AuditLogService, type CandidateAuditActor } from '../audit_log/audit_log.service';
import { CreateApplicationDto } from './dto/create';
import type {
  ApplicationPerformancePeriod,
  ApplicationPerformanceQueryDto,
  ApplicationPerformanceScope,
} from './dto/performance-query';
import type {
  ApplicationRejectedPeriod,
  ApplicationRejectedQueryDto,
  ApplicationRejectedScope,
} from './dto/rejected-query';
import { UpdateApplicationStatusDto } from './dto/update';
@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private readonly statusOrder = [
    'applied',
    'reviewing',
    'contacted',
    'interviewing',
    'waiting_response',
    'accepted',
    'rejected',
  ] as const;

  private readonly statusLabelMap: Record<(typeof this.statusOrder)[number], string> = {
    applied: 'Applied',
    reviewing: 'Reviewing',
    contacted: 'Contacted',
    interviewing: 'Interviewing',
    waiting_response: 'Waiting Response',
    accepted: 'Accepted',
    rejected: 'Rejected',
  };

  private normalizeStatusKey(status?: string | null): (typeof this.statusOrder)[number] {
    const normalized = (status || '').trim().toLowerCase().replace(/[_-]+/g, ' ');

    if (normalized.includes('review')) return 'reviewing';
    if (normalized.includes('in contact') || normalized.includes('contacted')) return 'contacted';
    if (normalized.includes('interview')) return 'interviewing';
    if (normalized.includes('waiting response')) return 'waiting_response';
    if (normalized.includes('closed') || normalized.includes('accept') || normalized.includes('pass')) return 'accepted';
    if (normalized.includes('not suitable') || normalized.includes('reject') || normalized.includes('fail')) return 'rejected';

    return 'applied';
  }

  private resolvePeriodStart(period: ApplicationPerformancePeriod) {
    const now = new Date();

    if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    if (period === 'quarter') {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
    }

    return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  private matchesScope(
    scope: ApplicationPerformanceScope,
    department?: { full_name?: string | null; acronym_name?: string | null } | null,
  ) {
    if (scope === 'all') return true;

    const label = `${department?.full_name || ''} ${department?.acronym_name || ''}`.trim().toLowerCase();

    if (scope === 'tech') {
      return label.includes('tech') || label.includes('it') || label.includes('engineering');
    }

    return label.includes('operation') || label.includes('ops') || label.includes('hr') || label.includes('finance');
  }

  private toPercent(numerator: number, denominator: number) {
    if (!denominator) return 0;
    return Number(((numerator / denominator) * 100).toFixed(1));
  }

  async getPerformanceSummary(query: ApplicationPerformanceQueryDto) {
    const period: ApplicationPerformancePeriod = query?.period || 'month';
    const scope: ApplicationPerformanceScope = query?.scope || 'all';
    const startAt = this.resolvePeriodStart(period);
    const now = new Date();

    const applications = await this.prisma.application.findMany({
      where: {
        created_at: { gte: startAt },
      },
      orderBy: { created_at: 'asc' },
      include: {
        recruitment_infor: {
          select: {
            id: true,
            post_title: true,
            internal_title: true,
            department: {
              select: {
                id: true,
                full_name: true,
                acronym_name: true,
              },
            },
            contactPerson: {
              select: {
                id: true,
                employee_name: true,
              },
            },
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

    const filtered = applications.filter((item) =>
      this.matchesScope(scope, item.recruitment_infor?.department),
    );

    const statusCounts: Record<(typeof this.statusOrder)[number], number> = {
      applied: 0,
      reviewing: 0,
      contacted: 0,
      interviewing: 0,
      waiting_response: 0,
      accepted: 0,
      rejected: 0,
    };

    const recruiterMap = new Map<
      string,
      {
        id: string;
        name: string;
        total: number;
        inProgress: number;
        accepted: number;
        rejected: number;
      }
    >();

    const positionMap = new Map<
      string,
      {
        name: string;
        total: number;
        accepted: number;
        rejected: number;
      }
    >();

    const monthBucket = new Map<string, { month: string; total: number; accepted: number; rejected: number }>();

    const monthCursor = new Date(startAt.getFullYear(), startAt.getMonth(), 1, 0, 0, 0, 0);
    while (monthCursor <= now) {
      const key = `${monthCursor.getFullYear()}-${monthCursor.getMonth()}`;
      const monthLabel = monthCursor.toLocaleString('en-US', { month: 'short' });

      monthBucket.set(key, {
        month: monthLabel,
        total: 0,
        accepted: 0,
        rejected: 0,
      });

      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    for (const app of filtered) {
      const statusKey = this.normalizeStatusKey(app.status);
      statusCounts[statusKey] += 1;

      const isInProgress =
        statusKey === 'reviewing' ||
        statusKey === 'contacted' ||
        statusKey === 'interviewing' ||
        statusKey === 'waiting_response';

      const isAccepted = statusKey === 'accepted';
      const isRejected = statusKey === 'rejected';

      const recruiterId = app.recruitment_infor?.contactPerson?.id || 'unassigned';
      const recruiterName = app.recruitment_infor?.contactPerson?.employee_name || 'Unassigned recruiter';

      if (!recruiterMap.has(recruiterId)) {
        recruiterMap.set(recruiterId, {
          id: recruiterId,
          name: recruiterName,
          total: 0,
          inProgress: 0,
          accepted: 0,
          rejected: 0,
        });
      }

      const recruiter = recruiterMap.get(recruiterId)!;
      recruiter.total += 1;
      if (isInProgress) recruiter.inProgress += 1;
      if (isAccepted) recruiter.accepted += 1;
      if (isRejected) recruiter.rejected += 1;

      const positionName =
        app.recruitment_infor?.positionPost?.name_post ||
        app.recruitment_infor?.post_title ||
        app.recruitment_infor?.internal_title ||
        'Unassigned position';

      if (!positionMap.has(positionName)) {
        positionMap.set(positionName, {
          name: positionName,
          total: 0,
          accepted: 0,
          rejected: 0,
        });
      }

      const position = positionMap.get(positionName)!;
      position.total += 1;
      if (isAccepted) position.accepted += 1;
      if (isRejected) position.rejected += 1;

      const createdAt = new Date(app.created_at);
      const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const trend = monthBucket.get(monthKey);
      if (trend) {
        trend.total += 1;
        if (isAccepted) trend.accepted += 1;
        if (isRejected) trend.rejected += 1;
      }
    }

    const totalApplications = filtered.length;
    const inProgress =
      statusCounts.reviewing +
      statusCounts.contacted +
      statusCounts.interviewing +
      statusCounts.waiting_response;
    const accepted = statusCounts.accepted;
    const rejected = statusCounts.rejected;

    const pipeline = this.statusOrder.map((statusKey, index) => {
      const count = statusCounts[statusKey];
      const previousCount = index > 0 ? statusCounts[this.statusOrder[index - 1]] : 0;

      return {
        key: statusKey,
        label: this.statusLabelMap[statusKey],
        count,
        conversionFromPrevious: index === 0 ? null : this.toPercent(count, previousCount),
      };
    });

    const byRecruiter = Array.from(recruiterMap.values())
      .map((item) => ({
        ...item,
        acceptRate: this.toPercent(item.accepted, item.total),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const byPosition = Array.from(positionMap.values())
      .map((item) => ({
        ...item,
        acceptRate: this.toPercent(item.accepted, item.total),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const trend = Array.from(monthBucket.values());

    return {
      generatedAt: new Date().toISOString(),
      period,
      scope,
      totals: {
        totalApplications,
        inProgress,
        accepted,
        rejected,
        acceptRate: this.toPercent(accepted, totalApplications),
      },
      pipeline,
      byRecruiter,
      byPosition,
      trend,
    };
  }

  async getRejectedSummary(query: ApplicationRejectedQueryDto) {
    const period: ApplicationRejectedPeriod = query?.period || 'month';
    const scope: ApplicationRejectedScope = query?.scope || 'all';
    const startAt = this.resolvePeriodStart(period);
    const now = new Date();

    const applications = await this.prisma.application.findMany({
      where: { created_at: { gte: startAt } },
      orderBy: { updated_at: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            candidate_code: true,
            candidate_name: true,
            email: true,
            phone_number: true,
          },
        },
        recruitment_infor: {
          select: {
            id: true,
            post_title: true,
            internal_title: true,
            department: {
              select: { id: true, full_name: true, acronym_name: true },
            },
            contactPerson: {
              select: { id: true, employee_name: true },
            },
            positionPost: {
              select: { id: true, name_post: true },
            },
          },
        },
      },
    });

    const filtered = applications.filter((app) =>
      this.matchesScope(scope, app.recruitment_infor?.department),
    );

    const totalInPeriod = filtered.length;
    const rejectedApps = filtered.filter(
      (app) => this.normalizeStatusKey(app.status) === 'rejected',
    );
    const totalRejected = rejectedApps.length;
    const rejectionRate = this.toPercent(totalRejected, totalInPeriod);

    const recruiterMap = new Map<string, { id: string; name: string; total: number; rejected: number }>();
    const positionMap = new Map<string, { position: string; total: number; rejected: number }>();
    const departmentMap = new Map<string, { department: string; total: number; rejected: number }>();

    const monthBucket = new Map<string, { month: string; total: number; rejected: number }>();
    const monthCursor = new Date(startAt.getFullYear(), startAt.getMonth(), 1, 0, 0, 0, 0);
    while (monthCursor <= now) {
      const key = `${monthCursor.getFullYear()}-${monthCursor.getMonth()}`;
      monthBucket.set(key, {
        month: monthCursor.toLocaleString('en-US', { month: 'short' }),
        total: 0,
        rejected: 0,
      });
      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    for (const app of filtered) {
      const isRejected = this.normalizeStatusKey(app.status) === 'rejected';

      const recruiterId = app.recruitment_infor?.contactPerson?.id || 'unassigned';
      const recruiterName = app.recruitment_infor?.contactPerson?.employee_name || 'Unassigned';
      if (!recruiterMap.has(recruiterId)) {
        recruiterMap.set(recruiterId, { id: recruiterId, name: recruiterName, total: 0, rejected: 0 });
      }
      const recruiter = recruiterMap.get(recruiterId)!;
      recruiter.total += 1;
      if (isRejected) recruiter.rejected += 1;

      const positionName =
        app.recruitment_infor?.positionPost?.name_post ||
        app.recruitment_infor?.post_title ||
        app.recruitment_infor?.internal_title ||
        'Unknown position';
      if (!positionMap.has(positionName)) {
        positionMap.set(positionName, { position: positionName, total: 0, rejected: 0 });
      }
      const pos = positionMap.get(positionName)!;
      pos.total += 1;
      if (isRejected) pos.rejected += 1;

      const departmentName =
        app.recruitment_infor?.department?.full_name ||
        app.recruitment_infor?.department?.acronym_name ||
        'Unknown department';
      if (!departmentMap.has(departmentName)) {
        departmentMap.set(departmentName, { department: departmentName, total: 0, rejected: 0 });
      }
      const dept = departmentMap.get(departmentName)!;
      dept.total += 1;
      if (isRejected) dept.rejected += 1;

      const dateRef = new Date(app.updated_at);
      const monthKey = `${dateRef.getFullYear()}-${dateRef.getMonth()}`;
      const bucket = monthBucket.get(monthKey);
      if (bucket) {
        bucket.total += 1;
        if (isRejected) bucket.rejected += 1;
      }
    }

    const byRecruiter = Array.from(recruiterMap.values())
      .map((item) => ({
        ...item,
        rejectionRate: this.toPercent(item.rejected, item.total),
      }))
      .sort((a, b) => b.rejected - a.rejected)
      .slice(0, 10);

    const byPosition = Array.from(positionMap.values())
      .map((item) => ({
        ...item,
        rejectionRate: this.toPercent(item.rejected, item.total),
      }))
      .sort((a, b) => b.rejected - a.rejected)
      .slice(0, 10);

    const byDepartment = Array.from(departmentMap.values())
      .map((item) => ({
        ...item,
        rejectionRate: this.toPercent(item.rejected, item.total),
      }))
      .sort((a, b) => b.rejected - a.rejected);

    const recentRejected = rejectedApps.slice(0, 20).map((app) => ({
      candidateId: app.candidate.id,
      candidateCode: app.candidate.candidate_code || '-',
      candidateName: app.candidate.candidate_name || 'Unknown',
      email: app.candidate.email || '-',
      phone: app.candidate.phone_number || '-',
      position:
        app.recruitment_infor?.positionPost?.name_post ||
        app.recruitment_infor?.post_title ||
        app.recruitment_infor?.internal_title ||
        '-',
      department:
        app.recruitment_infor?.department?.full_name ||
        app.recruitment_infor?.department?.acronym_name ||
        '-',
      recruiter: app.recruitment_infor?.contactPerson?.employee_name || '-',
      note: app.note || null,
      rejectedAt: app.updated_at.toISOString(),
    }));

    return {
      generatedAt: new Date().toISOString(),
      period,
      scope,
      totals: {
        totalInPeriod,
        totalRejected,
        rejectionRate,
      },
      byRecruiter,
      byPosition,
      byDepartment,
      trend: Array.from(monthBucket.values()),
      recentRejected,
    };
  }

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
            workLocation: true,
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