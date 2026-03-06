import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Skill } from '@prisma/client';
import { SkillFilterType } from './dto/filter_type';
import { SkillPaginType } from './dto/pagin_type';
import { CreateSkillDto } from './dto/create';
import { UpdateSkillDto } from './dto/update';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSkillDto) {
  return this.createRecursive(data, null);
}

private async createRecursive(
  data: CreateSkillDto,
  parentId: string | null,
) {
  const skill = await this.prisma.skill.create({
    data: {
      name: data.name,
      parent_id: parentId,
    },
  });

  if (data.children && data.children.length > 0) {
    for (const child of data.children) {
      await this.createRecursive(child, skill.id);
    }
  }

  return skill;
}
  async getAll(params: SkillFilterType): Promise<SkillPaginType> {
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
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [data, total_items] = await Promise.all([
      this.prisma.skill.findMany({
        where: whereCondition,
        skip,
        take: items_per_pages,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.skill.count({ where: whereCondition }),
    ]);

    return {
      data,
      current_pages: pages,
      items_per_pages,
      total_items,
    };
  }
  async getById(id: string): Promise<Skill | null> {
    return this.prisma.skill.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
      },
    });
  }
  async update(id: string, data: UpdateSkillDto): Promise<Skill> {
  const skill = await this.prisma.skill.findUnique({
    where: { id },
    include: { children: true }, 
  });

  if (!skill) {
    throw new HttpException('Skill không tồn tại', HttpStatus.BAD_REQUEST);
  }

  const updatedSkill = await this.prisma.skill.update({
    where: { id },
    data: {
      name: data.name,
      parent_id: data.parent_id ?? skill.parent_id,
      updated_at: new Date(),
    },
  });

  if (data.children && data.children.length > 0) {
    for (const child of data.children) {
      if (child.id) {
        await this.update(child.id, child);
      } else {
        await this.createRecursive(child, updatedSkill.id);
      }
    }
  }

  return updatedSkill;
}
  async delete(id: string): Promise<Skill> {
    return this.prisma.skill.update({
      where: { id },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  }
  async getTree() {
    const skills = await this.prisma.skill.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'asc' },
    });

    const map = new Map();

    skills.forEach(skill => {
      map.set(skill.id, { ...skill, children: [] });
    });

    const tree: any[] = [];

    skills.forEach(skill => {
      if (skill.parent_id) {
        const parent = map.get(skill.parent_id);
        if (parent) {
          parent.children.push(map.get(skill.id));
        }
      } else {
        tree.push(map.get(skill.id));
      }
    });

    return tree;
  }
}