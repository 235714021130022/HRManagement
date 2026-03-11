import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Setting_Potential_Type } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PotentialFilterType } from './dto/filter_type';
import { PotentialPaginType } from './dto/pagin_type';
import { UpdatePotentialTypeDTO } from './dto/update_potcan';
import { generateCode } from 'src/common/utils/generate-code.util';
import { CreatePotentialTypeDTO } from './dto/create_potcan';

@Injectable()
export class PotcanService {
    constructor(private prismaService: PrismaService){}
   async create(data: CreatePotentialTypeDTO){
        return this.prismaService.setting_Potential_Type.create({
            data: {
                ...data
            }
        })
    }
    async getAll(filter: PotentialFilterType): Promise<PotentialPaginType>{
        const items_per_pages = Number(filter.items_per_pages) || 10;
        const pages = Number(filter.pages) || 1;
        const search = filter.search ? filter.search.trim() : '';

        const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;

        const potential = await this.prismaService.setting_Potential_Type.findMany({
            take: items_per_pages,
            skip,
            where: {
                is_active: true,
                OR: [
                    {
                        name: { contains: search, mode: 'insensitive' }
                    },
                    {
                        description: { contains: search, mode: 'insensitive' }
                    }
                ]
            },
            orderBy: [
                { created_at: 'desc' },
                { id: 'desc' },
            ]
        })

        const total_items = await this.prismaService.setting_Potential_Type.count({
            where: {
                is_active: true,
                OR: [
                    {
                        name: { contains: search, mode: 'insensitive' }
                    },
                    {
                        description: { contains: search, mode: 'insensitive' }
                    }
                ]
            }
        })

        return {
            data: potential,
            current_pages: pages,
            items_per_pages,
            total_items
        }
    }

    async getByID(id: string): Promise<Setting_Potential_Type | null>{
        return this.prismaService.setting_Potential_Type.findFirst({
            where: { id }
        })
    }

    async update(id: string, data: UpdatePotentialTypeDTO): Promise<Setting_Potential_Type>{
        const potential = await this.prismaService.setting_Potential_Type.findUnique({
            where: { id },
            select: { id: true }
        })

        if(!potential){
            throw new HttpException('This potential type is not found', HttpStatus.BAD_REQUEST)
        }

        return this.prismaService.setting_Potential_Type.update({
            where: { id },
            data: {
                ...data
            }
        })
    }

    async delete(id: string): Promise<Setting_Potential_Type>{
        return this.prismaService.setting_Potential_Type.update({
            where: { id },
            data: { is_active: false }
        })
    }
}
