import { Injectable, NotFoundException } from '@nestjs/common';
import { Candidate } from '@prisma/client';
import { generateCode } from 'src/common/utils/generate-code.util';
import { PrismaService } from 'src/prisma.service';
import { CreateCandidateDto } from './dto/create';
import { CandidateFilterType } from './dto/filter_type';
import { CandidatePaginType } from './dto/pagin_type';
import { UpdateCandidateDto } from './dto/update';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class CandidateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCandidateDto): Promise<Candidate> {
    const { candidate_code, candidateExperiences, ...rest } = data;

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

    return this.prisma.candidate.create({
      data: {
        ...rest,
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
      include: {candidateExperiences: true}
    });
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
            }
            }
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    return candidate;
  }

async update(id: string, data: UpdateCandidateDto): Promise<Candidate> {
  const candidate = await this.prisma.candidate.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!candidate) throw new NotFoundException("Candidate not found");

  const { candidateExperiences, ...rest } = data;

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

  return this.prisma.candidate.update({
    where: { id },
    data: {
      ...rest,
      date_of_birth: rest.date_of_birth ? new Date(rest.date_of_birth) : undefined,
      date_applied: rest.date_applied ? new Date(rest.date_applied) : undefined,
      updated_at: new Date(),
      ...(candidateExperiences ? { candidateExperiences: nestedExp } : {}),
    },
    include: {
      candidateExperiences: { where: { is_active: true } }, // để trả về chỉ exp active
    },
  });
}

  async delete(id: string): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    return this.prisma.candidate.update({
      where: { id },
      data: { is_active: false, updated_at: new Date() },
    });
  }

  async replaceCv(candidate_id: string, newFileName: string){
    const candidate = await this.prisma.candidate.findUnique({
      where: {id: candidate_id},
      select: {id: true, cv_file: true},
    })

    if(!candidate) throw new NotFoundException('Candidate not found');
  
    if(candidate.cv_file){
      const oldPath = path.join(process.cwd(), 'uploads', 'cv', candidate.cv_file );
      fs.promises.unlink(oldPath).catch(()=> {})
    }

    return this.prisma.candidate.update({
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
      
    }
}