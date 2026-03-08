import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Candidate } from '@prisma/client';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { AuditLogService, type CandidateAuditActor } from '../audit_log/audit_log.service';
import { CreateCandidateDto } from './dto/create';
import { CandidateFilterType } from './dto/filter_type';
import { CandidatePaginType } from './dto/pagin_type';
import { UpdateCandidateDto } from './dto/update';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class CandidateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async validatePotentialType(potentialTypeId: string) {
    const potentialType = await this.prisma.setting_Potential_Type.findFirst({
      where: {
        id: potentialTypeId,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!potentialType) {
      throw new BadRequestException('Potential type is invalid or inactive');
    }

    return potentialType;
  }

  async create(data: CreateCandidateDto, actor?: CandidateAuditActor): Promise<Candidate> {
    const { candidate_code, candidateExperiences, ...rest } = data;

    let potentialTypeName: string | null = null;
    const normalizedPotentialTypeId = data.potential_type_id || undefined;
    const normalizedIsPotential =
      normalizedPotentialTypeId && data.is_potential !== false
        ? true
        : data.is_potential;

    if (normalizedIsPotential === true && !normalizedPotentialTypeId) {
      throw new BadRequestException('potential_type_id is required when is_potential is true');
    }

    if (normalizedIsPotential === false && normalizedPotentialTypeId) {
      throw new BadRequestException('Cannot set potential_type_id when is_potential is false');
    }

    if (normalizedPotentialTypeId) {
      const potentialType = await this.validatePotentialType(normalizedPotentialTypeId);
      potentialTypeName = potentialType.name;
    }

    const lastCandidate = await this.prisma.candidate.findFirst({
      where: {
        candidate_code: { not: null, startsWith: 'CA_' },
      },
      orderBy: { candidate_code: 'desc' },
      select: { candidate_code: true },
    });

    let nextNumber = 1;
    const last = lastCandidate?.candidate_code;
    if (last) {
      const match = last.match(/^CA_(\d+)$/);
      if (match) nextNumber = Number(match[1]) + 1;
    }

    const code = candidate_code || generateCode('CA', nextNumber);

    const created = await this.prisma.candidate.create({
      data: {
        ...rest,
        is_potential: normalizedIsPotential ?? false,
        potential_type_id: normalizedIsPotential ? normalizedPotentialTypeId : undefined,
        candidate_code: code,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
        date_applied: data.date_applied ? new Date(data.date_applied) : undefined,
        candidateExperiences: candidateExperiences ? {
            create: candidateExperiences.map((exp) => ({
                ...exp,
                from_month: exp.from_month ? new Date(exp.from_month) : undefined,
                to_month: exp.to_month ? new Date(exp.to_month) : undefined,
            }))
        }: undefined,
      },
      include: {candidateExperiences: true, statusApplication: true}
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: created.id,
      action: 'CANDIDATE_CREATED',
      message: 'Created candidate profile',
      metadata: {
        candidate_code: created.candidate_code,
        candidate_name: created.candidate_name,
        is_potential: created.is_potential,
        potential_type_id: created.potential_type_id,
        potential_type_name: potentialTypeName,
      },
      ...actor,
    });

    return created;
  }

  async getAll(filter: CandidateFilterType): Promise<CandidatePaginType> {
    const items_per_pages = Number(filter.items_per_pages) || 10;
    const pages = Number(filter.pages) || 1;
    const search = filter.search?.trim() || '';
    const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

    const whereCondition = {
      is_active: true,
      OR: [
        { candidate_name: { contains: search, mode: 'insensitive' as const } },
        { candidate_code: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone_number: { contains: search, mode: 'insensitive' as const } },
      ],
    };

    const [candidates, total_items] = await Promise.all([
      this.prisma.candidate.findMany({
        take: items_per_pages,
        skip,
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        include: {
            candidateExperiences: {
                where: {
                is_active: true
                }
            },
            statusApplication: {
                select: {
                  id: true,
                }
            },
            jobCandidates: {
                select: {
                    id: true,
                }
            },
            potential: {
              select: {
                id: true,
                name: true,
                is_active: true,
              }
            }
            }
      }),
      this.prisma.candidate.count({ where: whereCondition }),
    ]);

    return { data: candidates, current_pages: pages, items_per_pages, total_items };
  }

  async getByID(id: string): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
            candidateExperiences: {
                where: {
                is_active: true
                }
            },
            jobCandidates: {
              include: {
                job: {
                  include: {
                    employee: {
                      select: {
                        id: true,
                        employee_name: true,
                      },
                    },
                  },
                },
              },
            },
            statusApplication: {
              orderBy: { updated_at: 'desc' },
              select: {
                id: true,
                status: true,
                note: true,
                recruitment_infor_id: true,
                recruitment_infor: {
                  select: {
                    id: true,
                    post_title: true,
                    internal_title: true,
                  },
                },
              },
            },
            potential: {
              select: {
                id: true,
                name: true,
                is_active: true,
              },
            },
            
            }
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

async update(id: string, data: UpdateCandidateDto, actor?: CandidateAuditActor): Promise<Candidate> {
  const candidate = await this.prisma.candidate.findUnique({
    where: { id },
    select: {
      id: true,
      is_potential: true,
      potential_type_id: true,
      potential: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!candidate) throw new NotFoundException("Candidate not found");

  const { candidateExperiences, ...rest } = data;

  const hasPotentialTypeField = Object.prototype.hasOwnProperty.call(data, 'potential_type_id');
  const hasIsPotentialField = Object.prototype.hasOwnProperty.call(data, 'is_potential');
  let nextPotentialTypeId = hasPotentialTypeField
    ? data.potential_type_id ?? null
    : candidate.potential_type_id;
  let nextIsPotential = hasIsPotentialField ? data.is_potential : candidate.is_potential;
  let potentialTypeName: string | null = candidate.potential?.name ?? null;

  if (nextPotentialTypeId && nextIsPotential !== false) {
    nextIsPotential = true;
  }

  if (nextIsPotential === false) {
    nextPotentialTypeId = null;
    potentialTypeName = null;
  }

  if (nextIsPotential === true && !nextPotentialTypeId) {
    throw new BadRequestException('potential_type_id is required when is_potential is true');
  }

  if (nextPotentialTypeId) {
    const potentialType = await this.validatePotentialType(nextPotentialTypeId);
    potentialTypeName = potentialType.name;
  }

  const createExp = candidateExperiences?.filter((e) => !e.id) ?? [];
  const updateExp = candidateExperiences?.filter((e) => e.id && e.is_active !== false) ?? [];
  const deleteExp = candidateExperiences?.filter((e) => e.id && e.is_active === false) ?? [];

  const nestedExp: any = {};

  if (createExp.length) {
    nestedExp.create = createExp.map((exp) => ({
      company_name: exp.company_name,
      position: exp.position,
      from_month: exp.from_month ? new Date(exp.from_month) : undefined,
      to_month: exp.to_month ? new Date(exp.to_month) : undefined,
      job_description: exp.job_description,
      is_active: true,
    }));
  }

  if (updateExp.length) {
    nestedExp.update = updateExp.map((exp) => ({
      where: { id: exp.id! },
      data: {
        company_name: exp.company_name,
        position: exp.position,
        from_month: exp.from_month ? new Date(exp.from_month) : undefined,
        to_month: exp.to_month ? new Date(exp.to_month) : undefined,
        job_description: exp.job_description,
      },
    }));
  }

  if (deleteExp.length) {
    nestedExp.update = [
      ...(nestedExp.update ?? []),
      ...deleteExp.map((exp) => ({
        where: { id: exp.id! },
        data: { is_active: false },
      })),
    ];
  }

  const updated = await this.prisma.candidate.update({
    where: { id },
    data: {
      ...rest,
      is_potential: nextIsPotential,
      potential_type_id: nextPotentialTypeId,
      date_of_birth: rest.date_of_birth ? new Date(rest.date_of_birth) : undefined,
      date_applied: rest.date_applied ? new Date(rest.date_applied) : undefined,
      updated_at: new Date(),
      ...(candidateExperiences ? { candidateExperiences: nestedExp } : {}),
    },
    include: {
      candidateExperiences: { where: { is_active: true } },
      potential: {
              select: {
                id: true,
                name: true,
                is_active: true,
              }
            },
            statusApplication: true
    },
  });

  await this.auditLogService.logCandidateActivity({
    candidateId: id,
    action:
      !candidate.is_potential && updated.is_potential
        ? 'CANDIDATE_MOVED_TO_TALENT_POOL'
        : candidate.is_potential && !updated.is_potential
          ? 'CANDIDATE_REMOVED_FROM_TALENT_POOL'
          : 'CANDIDATE_UPDATED',
    message:
      !candidate.is_potential && updated.is_potential
        ? 'Moved candidate to talent pool'
        : candidate.is_potential && !updated.is_potential
          ? 'Removed candidate from talent pool'
          : 'Updated candidate profile',
    metadata: {
      updated_fields: Object.keys(rest),
      is_potential_before: candidate.is_potential,
      is_potential_after: updated.is_potential,
      potential_type_id_before: candidate.potential_type_id,
      potential_type_id_after: updated.potential_type_id,
      potential_type_name_after: potentialTypeName,
      experience_changes: {
        created: createExp.length,
        updated: updateExp.length,
        deleted: deleteExp.length,
      },
    },
    ...actor,
  });

  return updated;
}

  async delete(id: string, actor?: CandidateAuditActor): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const deleted = await this.prisma.candidate.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: id,
      action: 'CANDIDATE_DEACTIVATED',
      message: 'Deactivated candidate profile',
      ...actor,
    });

    return deleted;
  }

  async replaceCv(candidate_id: string, newFileName: string, actor?: CandidateAuditActor){
    const candidate = await this.prisma.candidate.findUnique({
      where: {id: candidate_id},
      select: {id: true, cv_file: true},
    })

    if(!candidate) throw new NotFoundException('Candidate not found');
  
    if(candidate.cv_file){
      const oldPath = path.join(process.cwd(), 'uploads', 'cv', candidate.cv_file );
      fs.promises.unlink(oldPath).catch(()=> {})
    }

    const updated = await this.prisma.candidate.update({
          where: { id: candidate_id },
          data: {
            cv_file: newFileName,
            cv_uploaded_at: new Date(),
          },
          select: {
            id: true,
            cv_file: true,
            cv_uploaded_at: true,
          },
        });

    await this.auditLogService.logCandidateActivity({
      candidateId: candidate_id,
      action: 'CANDIDATE_CV_REPLACED',
      message: 'Uploaded/Replaced candidate CV file',
      metadata: { cv_file: newFileName },
      ...actor,
    });

    return updated;
      
    }

  async replaceAvatar(candidate_id: string, newFileName: string, actor?: CandidateAuditActor){
    const candidate = await this.prisma.candidate.findUnique({
      where: {id: candidate_id},
      select: {id: true, avatar_file: true},
    });

    if(!candidate) throw new NotFoundException('Candidate not found');

    if(candidate.avatar_file){
      const oldPath = path.join(process.cwd(), 'uploads', 'avatar', candidate.avatar_file);
      fs.promises.unlink(oldPath).catch(() => {});
    }

    const updated = await this.prisma.candidate.update({
      where: { id: candidate_id },
      data: {
        avatar_file: newFileName,
        avatar_uploaded_at: new Date(),
      },
      select: {
        id: true,
        avatar_file: true,
        avatar_uploaded_at: true,
      },
    });

    await this.auditLogService.logCandidateActivity({
      candidateId: candidate_id,
      action: 'CANDIDATE_AVATAR_REPLACED',
      message: 'Uploaded/Replaced candidate avatar file',
      metadata: { avatar_file: newFileName },
      ...actor,
    });

    return updated;
  }
}