import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRecruitmentInforDto } from './dto/created_recinform';
import { generateCode } from 'src/common/utils/generate-code.util';
import { RecruitmentInforFilterType } from './dto/recinform_filter_type';
import { RecruitmentInforPaginType } from './dto/recinform_pagin_type';
import { UpdateRecruitmentInforDto } from './dto/updated_recinform';
import type { RecruitmentCostPeriod, RecruitmentCostQueryDto, RecruitmentCostScope } from './dto/cost-query';
import type { RecruitmentPlanPeriod, RecruitmentPlanQueryDto, RecruitmentPlanScope } from './dto/plan-query';
import { Recruitment_Infor } from '@prisma/client';
@Injectable()
export class RecinformService {
    constructor (private prismaService: PrismaService){}

  private resolvePeriodStart(period: RecruitmentCostPeriod) {
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
    scope: RecruitmentCostScope,
    department?: { full_name?: string | null; acronym_name?: string | null } | null,
  ) {
    if (scope === 'all') return true;

    const label = `${department?.full_name || ''} ${department?.acronym_name || ''}`.trim().toLowerCase();

    if (scope === 'tech') {
      return label.includes('tech') || label.includes('it') || label.includes('engineering');
    }

    return label.includes('operation') || label.includes('ops') || label.includes('hr') || label.includes('finance');
  }

  private isAcceptedStatus(status?: string | null) {
    const normalized = (status || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
    return normalized.includes('accepted') || normalized.includes('closed') || normalized.includes('pass');
  }

  private toNumber(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  async getCostSummary(query: RecruitmentCostQueryDto) {
    const period: RecruitmentCostPeriod = query?.period || 'month';
    const scope: RecruitmentCostScope = query?.scope || 'all';
    const startAt = this.resolvePeriodStart(period);
    const now = new Date();

    const recruitments = await this.prismaService.recruitment_Infor.findMany({
      where: {
        created_at: {
          gte: startAt,
        },
      },
      include: {
        recruitmentCosts: true,
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
      },
    });

    const filteredRecruitments = recruitments.filter((item) =>
      this.matchesScope(scope, item.department),
    );

    const recruitmentIds = filteredRecruitments.map((item) => item.id);

    const applications = recruitmentIds.length
      ? await this.prismaService.application.findMany({
        where: {
          recruitment_infor_id: {
            in: recruitmentIds,
          },
          created_at: {
            gte: startAt,
          },
        },
        select: {
          recruitment_infor_id: true,
          created_at: true,
          status: true,
        },
      })
      : [];

    const acceptedByRecruitment = new Map<string, number>();
    for (const item of applications) {
      if (!this.isAcceptedStatus(item.status)) continue;
      acceptedByRecruitment.set(
        item.recruitment_infor_id,
        (acceptedByRecruitment.get(item.recruitment_infor_id) || 0) + 1,
      );
    }

    const monthBucket = new Map<string, { month: string; cost: number; accepted: number }>();
    const monthCursor = new Date(startAt.getFullYear(), startAt.getMonth(), 1, 0, 0, 0, 0);
    while (monthCursor <= now) {
      const key = `${monthCursor.getFullYear()}-${monthCursor.getMonth()}`;
      monthBucket.set(key, {
        month: monthCursor.toLocaleString('en-US', { month: 'short' }),
        cost: 0,
        accepted: 0,
      });
      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    const byTypeMap = new Map<string, number>();
    const byDepartmentMap = new Map<string, { department: string; amount: number; recruitments: number; accepted: number }>();
    const byRecruiterMap = new Map<string, { recruiter: string; amount: number; recruitments: number; accepted: number }>();
    const topRecruitments: Array<{
      code: string;
      title: string;
      department: string;
      amount: number;
      accepted: number;
      costPerAccepted: number;
      status: string;
    }> = [];

    let totalCost = 0;
    let totalAccepted = 0;
    let totalRecruitmentsWithCost = 0;

    for (const recruitment of filteredRecruitments) {
      const costs = Array.isArray(recruitment.recruitmentCosts)
        ? recruitment.recruitmentCosts
        : [];
      const recruitmentCost = costs.reduce((sum, cost) => sum + this.toNumber(cost.amount), 0);

      if (recruitmentCost <= 0) continue;

      totalRecruitmentsWithCost += 1;
      totalCost += recruitmentCost;

      const accepted = acceptedByRecruitment.get(recruitment.id) || 0;
      totalAccepted += accepted;

      for (const cost of costs) {
        const amount = this.toNumber(cost.amount);
        if (amount <= 0) continue;
        const type = (cost.cost_type || 'Other').trim() || 'Other';
        byTypeMap.set(type, (byTypeMap.get(type) || 0) + amount);
      }

      const departmentName =
        recruitment.department?.full_name ||
        recruitment.department?.acronym_name ||
        'Unknown department';

      if (!byDepartmentMap.has(departmentName)) {
        byDepartmentMap.set(departmentName, {
          department: departmentName,
          amount: 0,
          recruitments: 0,
          accepted: 0,
        });
      }

      const department = byDepartmentMap.get(departmentName)!;
      department.amount += recruitmentCost;
      department.recruitments += 1;
      department.accepted += accepted;

      const recruiterName = recruitment.contactPerson?.employee_name || 'Unassigned recruiter';

      if (!byRecruiterMap.has(recruiterName)) {
        byRecruiterMap.set(recruiterName, {
          recruiter: recruiterName,
          amount: 0,
          recruitments: 0,
          accepted: 0,
        });
      }

      const recruiter = byRecruiterMap.get(recruiterName)!;
      recruiter.amount += recruitmentCost;
      recruiter.recruitments += 1;
      recruiter.accepted += accepted;

      const createdAt = recruitment.created_at ? new Date(recruitment.created_at) : null;
      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
        const monthData = monthBucket.get(monthKey);
        if (monthData) {
          monthData.cost += recruitmentCost;
          monthData.accepted += accepted;
        }
      }

      topRecruitments.push({
        code: recruitment.recruitment_code || '-',
        title: recruitment.post_title || recruitment.internal_title || 'Untitled recruitment',
        department: departmentName,
        amount: recruitmentCost,
        accepted,
        costPerAccepted: accepted > 0 ? recruitmentCost / accepted : recruitmentCost,
        status: recruitment.status || 'UNKNOWN',
      });
    }

    const byType = Array.from(byTypeMap.entries())
      .map(([type, amount]) => ({
        type,
        amount,
        sharePercent: totalCost > 0 ? Number(((amount / totalCost) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const byDepartment = Array.from(byDepartmentMap.values())
      .map((item) => ({
        ...item,
        costPerAccepted: item.accepted > 0 ? item.amount / item.accepted : item.amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const byRecruiter = Array.from(byRecruiterMap.values())
      .map((item) => ({
        ...item,
        costPerAccepted: item.accepted > 0 ? item.amount / item.accepted : item.amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    const trend = Array.from(monthBucket.values()).map((item) => ({
      ...item,
      costPerAccepted: item.accepted > 0 ? item.cost / item.accepted : item.cost,
    }));

    const top = topRecruitments
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      generatedAt: new Date().toISOString(),
      period,
      scope,
      totals: {
        totalCost,
        totalRecruitmentsWithCost,
        totalAccepted,
        costPerAccepted: totalAccepted > 0 ? totalCost / totalAccepted : totalCost,
      },
      byType,
      byDepartment,
      byRecruiter,
      trend,
      topRecruitments: top,
    };
  }

  async getPlanSummary(query: RecruitmentPlanQueryDto) {
    const period: RecruitmentPlanPeriod = query?.period || 'month';
    const scope: RecruitmentPlanScope = query?.scope || 'all';
    const startAt = this.resolvePeriodStart(period);
    const now = new Date();

    const recruitments = await this.prismaService.recruitment_Infor.findMany({
      where: { created_at: { gte: startAt } },
      include: {
        recruitmentPlans: {
          include: {
            recruitmentPlanChildBatches: true,
            recruitmentPlanChildPosteds: true,
          },
        },
        department: { select: { id: true, full_name: true, acronym_name: true } },
        contactPerson: { select: { id: true, employee_name: true } },
        positionPost: { select: { id: true, name_post: true } },
      },
    });

    const filteredRecruitments = recruitments.filter((r) =>
      this.matchesScope(scope, r.department),
    );

    const recruitmentIds = filteredRecruitments.map((r) => r.id);

    const applications = recruitmentIds.length
      ? await this.prismaService.application.findMany({
          where: { recruitment_infor_id: { in: recruitmentIds } },
          select: { recruitment_infor_id: true, status: true, created_at: true },
        })
      : [];

    const acceptedByRecruitment = new Map<string, number>();
    for (const app of applications) {
      if (!this.isAcceptedStatus(app.status)) continue;
      acceptedByRecruitment.set(
        app.recruitment_infor_id,
        (acceptedByRecruitment.get(app.recruitment_infor_id) || 0) + 1,
      );
    }

    const monthBucket = new Map<string, { month: string; planned: number; hired: number }>();
    const monthCursor = new Date(startAt.getFullYear(), startAt.getMonth(), 1, 0, 0, 0, 0);
    while (monthCursor <= now) {
      const key = `${monthCursor.getFullYear()}-${monthCursor.getMonth()}`;
      monthBucket.set(key, {
        month: monthCursor.toLocaleString('en-US', { month: 'short' }),
        planned: 0,
        hired: 0,
      });
      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    const byDepartmentMap = new Map<string, { department: string; recruitments: number; planned: number; hired: number }>();
    const byPositionMap = new Map<string, { position: string; recruitments: number; planned: number; hired: number }>();
    const channelMap = new Map<string, number>();
    const activeBatches: Array<{
      title: string;
      recruitmentTitle: string;
      fromDate: string | null;
      toDate: string | null;
      target: number;
      daysLeft: number;
    }> = [];
    const byRecruitmentList: Array<{
      id: string;
      code: string;
      title: string;
      department: string;
      recruiter: string;
      position: string;
      planned: number;
      hired: number;
      remaining: number;
      fillRate: number;
      deadline: string | null;
      status: string;
    }> = [];

    let totalPlanned = 0;
    let totalHired = 0;

    for (const recruitment of filteredRecruitments) {
      const plans = Array.isArray(recruitment.recruitmentPlans) ? recruitment.recruitmentPlans : [];

      let planned = this.toNumber(recruitment.total_needed);
      if (planned <= 0 && plans.length > 0) {
        planned = plans.reduce((sum, plan) => {
          const batchTotal = (plan.recruitmentPlanChildBatches || []).reduce(
            (s, b) => s + this.toNumber(b.number_recruitment),
            0,
          );
          return sum + (batchTotal > 0 ? batchTotal : this.toNumber(plan.total_real_number));
        }, 0);
      }
      if (planned <= 0) planned = 1;

      const hired = acceptedByRecruitment.get(recruitment.id) || 0;
      const remaining = Math.max(0, planned - hired);
      const fillRate = Number(((hired / planned) * 100).toFixed(1));

      totalPlanned += planned;
      totalHired += hired;

      const departmentName =
        recruitment.department?.full_name ||
        recruitment.department?.acronym_name ||
        'Unknown department';
      const positionName = recruitment.positionPost?.name_post || 'Unknown position';
      const recruiterName = recruitment.contactPerson?.employee_name || 'Unassigned';
      const deadline = recruitment.application_deadline
        ? new Date(recruitment.application_deadline).toISOString().split('T')[0]
        : null;

      byRecruitmentList.push({
        id: recruitment.id,
        code: recruitment.recruitment_code || '-',
        title: recruitment.post_title || recruitment.internal_title || 'Untitled',
        department: departmentName,
        recruiter: recruiterName,
        position: positionName,
        planned,
        hired,
        remaining,
        fillRate,
        deadline,
        status: recruitment.status || 'UNKNOWN',
      });

      if (!byDepartmentMap.has(departmentName)) {
        byDepartmentMap.set(departmentName, { department: departmentName, recruitments: 0, planned: 0, hired: 0 });
      }
      const dept = byDepartmentMap.get(departmentName)!;
      dept.recruitments += 1;
      dept.planned += planned;
      dept.hired += hired;

      if (!byPositionMap.has(positionName)) {
        byPositionMap.set(positionName, { position: positionName, recruitments: 0, planned: 0, hired: 0 });
      }
      const pos = byPositionMap.get(positionName)!;
      pos.recruitments += 1;
      pos.planned += planned;
      pos.hired += hired;

      for (const plan of plans) {
        for (const batch of plan.recruitmentPlanChildBatches || []) {
          const toDate = batch.to_date ? new Date(batch.to_date) : null;
          if (toDate && toDate >= now) {
            const daysLeft = Math.ceil((toDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            activeBatches.push({
              title: batch.batches_title || 'Batch',
              recruitmentTitle: recruitment.post_title || recruitment.internal_title || 'Untitled',
              fromDate: batch.from_date ? new Date(batch.from_date).toISOString().split('T')[0] : null,
              toDate: toDate.toISOString().split('T')[0],
              target: this.toNumber(batch.number_recruitment),
              daysLeft,
            });
          }
        }

        for (const posted of plan.recruitmentPlanChildPosteds || []) {
          const channel = (posted.job_board || 'Other').trim() || 'Other';
          channelMap.set(channel, (channelMap.get(channel) || 0) + 1);
        }
      }

      const createdAt = recruitment.created_at ? new Date(recruitment.created_at) : null;
      if (createdAt && !Number.isNaN(createdAt.getTime())) {
        const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
        const monthData = monthBucket.get(monthKey);
        if (monthData) {
          monthData.planned += planned;
          monthData.hired += hired;
        }
      }
    }

    const byDepartment = Array.from(byDepartmentMap.values())
      .map((item) => ({
        ...item,
        fillRate: item.planned > 0 ? Number(((item.hired / item.planned) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.planned - a.planned);

    const byPosition = Array.from(byPositionMap.values())
      .map((item) => ({
        ...item,
        fillRate: item.planned > 0 ? Number(((item.hired / item.planned) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.planned - a.planned);

    const postingChannels = Array.from(channelMap.entries())
      .map(([channel, postCount]) => ({ channel, postCount }))
      .sort((a, b) => b.postCount - a.postCount);

    const sortedBatches = activeBatches
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    return {
      generatedAt: new Date().toISOString(),
      period,
      scope,
      totals: {
        totalRecruitments: filteredRecruitments.length,
        totalPlanned,
        totalHired,
        totalRemaining: Math.max(0, totalPlanned - totalHired),
        fillRate: totalPlanned > 0 ? Number(((totalHired / totalPlanned) * 100).toFixed(1)) : 0,
      },
      byRecruitment: byRecruitmentList.slice(0, 20),
      byDepartment,
      byPosition,
      activeBatches: sortedBatches,
      postingChannels,
      trend: Array.from(monthBucket.values()),
    };
  }

    async create(data: CreateRecruitmentInforDto) {
    const { recruitment_code, plan, other_costs, ...rest } = data;

    const lastRI = await this.prismaService.recruitment_Infor.findFirst({
      where: { recruitment_code: { not: null, startsWith: 'REC_' } },
      orderBy: { recruitment_code: 'desc' }, // ✅ nên order theo code
      select: { recruitment_code: true },
    });

    let nextNumber = 1;
    const last = lastRI?.recruitment_code;
    if (last) {
      const m = last.match(/^REC_(\d+)$/);
      if (m) nextNumber = Number(m[1]) + 1;
    }

    const recCode = generateCode('REC', nextNumber);

    return this.prismaService.$transaction(async (tx) => {
      const rec = await tx.recruitment_Infor.create({
        data: {
          ...rest,
          recruitment_code: recCode,
          application_deadline: data.application_deadline ? new Date(data.application_deadline) : undefined,
          
        },
      });

      if (other_costs?.length) {
        await tx.recruitment_Costs.createMany({
          data: other_costs.map((x) => ({
            recruitment_id: rec.id,
            cost_type: x.cost_type ?? null,
            amount: x.amount ?? null,
            currency: x.currency ?? 'VND',
          })),
        });
      }

      if (plan?.length) {
        for (const p of plan) {
          const {
            batches,
            postes,
            monthly_target,
            expected_deadline,
            ...parent
          } = p;

          const parentCreated = await tx.recruitment_Plan_Parent.create({
            data: {
              ...parent,
              recruitment_id: rec.id,
              monthly_target: monthly_target ? new Date(monthly_target) : undefined,
              expected_deadline: expected_deadline ? new Date(expected_deadline) : undefined,
            },
          });

          if (batches?.length) {
            await tx.recruitment_Plan_Child_Batches.createMany({
              data: batches.map((b) => {
                const { from_date, to_date, monthly_target, ...restBatch } = b;
                return {
                  ...restBatch,
                  recruitment_plan_parent_id: parentCreated.id,
                  from_date: from_date ? new Date(from_date) : undefined,
                  to_date: to_date ? new Date(to_date) : undefined,
                  monthly_target: monthly_target ? new Date(monthly_target) : undefined,
                };
              }),
            });
          }

          if (postes?.length) {
            await tx.recruitment_Plan_Child_Posted.createMany({
              data: postes.map((po) => {
                const { posted_date, expiration_date, ...restPost } = po;
                return {
                  ...restPost,
                  recruitment_plan_parent_id: parentCreated.id,
                  posted_date: posted_date ? new Date(posted_date) : undefined,
                  expiration_date: expiration_date ? new Date(expiration_date) : undefined,
                };
              }),
            });
          }
        }
      }

      return tx.recruitment_Infor.findUnique({
      where: { id: rec.id },
      include: {
        recruitmentPlans: {
          include: {
            recruitmentPlanChildBatches: true,
            recruitmentPlanChildPosteds: true,
            
          },
        },
        recruitmentCosts: true,
        positionPost: true,
        workLocation: {select: {id: true, full_name: true}},
      },
    });
    });
  }
    async getAll(filter: RecruitmentInforFilterType): Promise<RecruitmentInforPaginType> {
  const items_per_pages = Number(filter.items_per_pages) || 10;
  const pages = Number(filter.pages) || 1;
  const search = filter.search ? filter.search.trim() : '';
  const status = filter.status?.trim();
  const departmentId = filter.department_id?.trim();

  const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

  const where: any = {
    is_active: true,
  };

  if (search) {
    where.OR = [
      { recruitment_code: { contains: search, mode: 'insensitive' as const } },
      { internal_title: { contains: search, mode: 'insensitive' as const } },
      { post_title: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  if (status && status.toUpperCase() !== 'ALL') {
    where.status = status;
  }

  if (departmentId && departmentId.toLowerCase() !== 'all') {
    where.department_id = departmentId;
  }

  const [recIn, total_items] = await Promise.all([
    this.prismaService.recruitment_Infor.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: items_per_pages,
      include: {
        recruitmentPlans: {
          include: {
            recruitmentPlanChildBatches: true,
            recruitmentPlanChildPosteds: true,
          },
        },
        recruitmentCosts: true, // chi phí khác
        
        department: {select: {id: true, full_name: true}},
        rank: {select: {id: true, name_rank: true}},
        workLocation: {select: {id: true, full_name: true}},
        contactPerson: {select: {id: true, employee_name: true}},
        positionPost: true
      },
    }),
    this.prismaService.recruitment_Infor.count({ where }),
  ]);

  return {
    total_items,
    current_pages: pages,
    data: recIn,
    items_per_pages,
  };
}


    async getByID (id: string): Promise<Recruitment_Infor|null>{
        return this.prismaService.recruitment_Infor.findFirst({
            where: {id},
            include: {
                recruitmentPlans: {
                    include:{
                        recruitmentPlanChildBatches: true,
                        recruitmentPlanChildPosteds: true
                    }
                },
                recruitmentCosts: true,
            department: {select: {id: true, full_name: true}},
            rank: {select: {id: true, name_rank: true}},
            workLocation: {select: {id: true, full_name: true}},
            contactPerson: {select: {id: true, employee_name: true}},
            positionPost: true
            }
        });
    }

    async update(id: string, data: UpdateRecruitmentInforDto) {
  const recInf = await this.prismaService.recruitment_Infor.findUnique({
    where: { id },
    select: { id: true, status: true, is_active: true },
  });
  if (!recInf) throw new HttpException('This position is not found', HttpStatus.BAD_REQUEST);

  const {
    other_costs,
    plan,
    ...info
  } = data;

  const dataUpdate: any = { ...info };
  const ACTIVE = new Set(["PUBLIC", "INTERNAL"]);
  const Inactive = new Set(["CLOSED", "STOP_RECEIVING", "DRAFT"]);

  if (typeof dataUpdate.status === 'string') {
    if (ACTIVE.has(dataUpdate.status)) dataUpdate.is_active = true;
    if (Inactive.has(dataUpdate.status)) dataUpdate.is_active = false;
  }
  if (typeof dataUpdate.is_active === 'boolean' && typeof dataUpdate.status !== 'string') {
    dataUpdate.status = dataUpdate.is_active ? "PUBLIC" : "STOP_RECEIVING";
  }
  return this.prismaService.$transaction(async (tx) => {
    await tx.recruitment_Infor.update({
     where: { id },
    data: {
      ...dataUpdate,
      updated_at: new Date(),
      application_deadline: data.application_deadline ? new Date(data.application_deadline) : undefined,
    },
    });

    if (other_costs) {
      await tx.recruitment_Costs.deleteMany({ where: { recruitment_id: id } });
      if (other_costs.length) {
        await tx.recruitment_Costs.createMany({
          data: other_costs.map(x => ({
            recruitment_id: id,
            cost_type: x.cost_type ?? null,
            amount: x.amount ?? null,
            currency: x.currency ?? 'VND',
          })),
        });
      }
    }

    if (plan) {
      await tx.recruitment_Plan_Parent.deleteMany({ where: { recruitment_id: id } });

      for (const p of plan) {
        const {
          batches,
          postes,
          monthly_target,
          expected_deadline,
          ...parent
        } = p;

        const parentCreated = await tx.recruitment_Plan_Parent.create({
          data: {
            ...parent,
            recruitment_id: id,
            monthly_target: monthly_target ? new Date(monthly_target) : undefined,
            expected_deadline: expected_deadline ? new Date(expected_deadline) : undefined,
          },
        });

        if (batches?.length) {
          await tx.recruitment_Plan_Child_Batches.createMany({
            data: batches.map((b) => {
              const { from_date, to_date, monthly_target, ...restBatch } = b;
              return {
                ...restBatch,
                recruitment_plan_parent_id: parentCreated.id,
                from_date: from_date ? new Date(from_date) : undefined,
                to_date: to_date ? new Date(to_date) : undefined,
                monthly_target: monthly_target ? new Date(monthly_target) : undefined,
              };
            }),
          });
        }

        if (postes?.length) {
          await tx.recruitment_Plan_Child_Posted.createMany({
            data: postes.map((po) => {
              const { posted_date, expiration_date, ...restPost } = po;
              return {
                ...restPost,
                recruitment_plan_parent_id: parentCreated.id,
                posted_date: posted_date ? new Date(posted_date) : undefined,
                expiration_date: expiration_date ? new Date(expiration_date) : undefined,
              };
            }),
          });
        }
      }
    }

    return tx.recruitment_Infor.findUnique({
      where: { id },
      include: {
        recruitmentPlans: { include: { recruitmentPlanChildBatches: true, recruitmentPlanChildPosteds: true } },
        recruitmentCosts: true,
        positionPost: true,
        workLocation: {select: {id: true, full_name: true}},
      },
    });
  });
}


    async delete (id: string): Promise<Recruitment_Infor>{
        return this.prismaService.recruitment_Infor.update({
            where: {id},
            data: { status: 'Closed', is_active: false}
        })
    }
}
