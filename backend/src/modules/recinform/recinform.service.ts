import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRecruitmentInforDto } from './dto/created_recinform';
import { generateCode } from 'src/common/utils/generate-code.util';
import { RecruitmentInforFilterType } from './dto/recinform_filter_type';
import { RecruitmentInforPaginType } from './dto/recinform_pagin_type';
import { UpdateRecruitmentInforDto } from './dto/updated_recinform';
import { Recruitment_Infor } from '@prisma/client';
@Injectable()
export class RecinformService {x
    constructor (private prismaService: PrismaService){}
    
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
          const { batches, postes, ...parent } = p;

          const parentCreated = await tx.recruitment_Plan_Parent.create({
            data: {
              recruitment_id: rec.id,
              monthly_target: p.monthly_target ? new Date(p.monthly_target) : undefined,
              expected_deadline: p.expected_deadline ? new Date(p.expected_deadline) : undefined,
            
              ...parent,
            },
          });

          if (batches?.length) {
            await tx.recruitment_Plan_Child_Batches.createMany({
              data: batches.map((b) => ({
                recruitment_plan_parent_id: parentCreated.id,
                from_date: b.from_date ? new Date(b.from_date) : undefined,
                to_date: b.to_date ? new Date(b.to_date) : undefined,
                ...b,
              })),
            });
          }

          if (postes?.length) {
            await tx.recruitment_Plan_Child_Posted.createMany({
              data: postes.map((po) => ({
                recruitment_plan_parent_id: parentCreated.id,
                posted_date: po.posted_date ? new Date(po.posted_date) : undefined,
                expiration_date: po.expiration_date ? new Date(po.expiration_date) : undefined,
                ...po,
              })),
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

  const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

  const where = {
    is_active: true,
    OR: [
      { recruitment_code: { contains: search, mode: 'insensitive' as const } },
      { internal_title: { contains: search, mode: 'insensitive' as const } },
      { post_title: { contains: search, mode: 'insensitive' as const } },
    ],
  };

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
        const { batches, postes, ...parent } = p;

        const parentCreated = await tx.recruitment_Plan_Parent.create({
          data: { recruitment_id: id, ...parent },
        });

        if (batches?.length) {
          await tx.recruitment_Plan_Child_Batches.createMany({
            data: batches.map(b => ({
              recruitment_plan_parent_id: parentCreated.id,
                              from_date: b.from_date ? new Date(b.from_date) : undefined,
                to_date: b.to_date ? new Date(b.to_date) : undefined,

              ...b,
            })),
          });
        }

        if (postes?.length) {
          await tx.recruitment_Plan_Child_Posted.createMany({
            data: postes.map(po => ({
              recruitment_plan_parent_id: parentCreated.id,
                              posted_date: po.posted_date ? new Date(po.posted_date) : undefined,
                expiration_date: po.expiration_date ? new Date(po.expiration_date) : undefined,

              ...po,
            })),
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
