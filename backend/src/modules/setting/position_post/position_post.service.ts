import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePositionPostDTO } from './dto/create_post';
import { generateCode } from 'src/common/utils/generate-code.util';
import { connect } from 'http2';
import { UpdatePostDTO } from './dto/update_post';
import { PostFilterType } from './dto/filter_type';
import { PostPaginType } from './dto/pagin_type';
import { Setting_Position_Posts } from '@prisma/client';

@Injectable()
export class PositionPostService {
    constructor (private prismaService: PrismaService){}
    async create (data: CreatePositionPostDTO){
        const { Setting_Process_Recruitment_id, unit_id,position_code , ...rest} = data;

        const lastPP = await this.prismaService.setting_Position_Posts.findFirst({
            where: { position_code: {not: null, startsWith: 'PP'}},
            orderBy: { created_at: 'desc'},
            select: {position_code: true}
        })

        let nextNumber = 1;
        const last = lastPP?.position_code;
        if (last){
            const m = last.match(/^PP_(\d+)$/);
            if(m) nextNumber = Number(m[1]) + 1;
        }
        const ppCode = generateCode('PP', nextNumber);
        return this.prismaService.setting_Position_Posts.create({
            data: {
                ...rest,
                position_code: ppCode,
                ... (Setting_Process_Recruitment_id ? { processRecruitment: {connect: { id: Setting_Process_Recruitment_id}}} : {}),
                ... (unit_id ? {inforCompany: {connect: {id: unit_id}}}: {}),
        
            }
        })
    }
    async getAll (filter: PostFilterType): Promise<PostPaginType>{
        const items_per_pages = Number(filter.items_per_pages) || 10;
        const pages = Number(filter.pages) || 1;
        const search = filter.search ? filter.search.trim() : '';

        const skip = pages > 1 ? (pages - 1) * items_per_pages : 0;
        const post = await this.prismaService.setting_Position_Posts.findMany({
            take: items_per_pages,
            skip,
            where: {
                is_active: true,
                OR: [
                    { name_post: {contains: search, mode: 'insensitive'}},
                    { position_code: {contains: search, mode: 'insensitive'}}
                ],
                AND: [
                    { status: {not: 'Ngừng sử dụng'}}
                ]
            },
            orderBy: {created_at: 'desc'}
        })
        const total_items = await this.prismaService.setting_Position_Posts.count({
            where: {
                is_active: true,
                OR: [
                    {name_post: {contains: search, mode: 'insensitive'}},
                    {position_code: {contains: search, mode: 'insensitive'}}
                ],
                AND: [
                    {status: {not: 'Ngừng sử dụng'}}
                ]
            }
        })
        return {
            data: post,
            current_pages: pages,
            total_items,
            items_per_pages
        }
    }
    async getByID(id: string): Promise<Setting_Position_Posts | null>{
        return this.prismaService.setting_Position_Posts.findFirst({
            where: {id}
        })
    }

    async update (id: string, data: UpdatePostDTO): Promise<Setting_Position_Posts>{
        const post = await this.prismaService.setting_Position_Posts.findUnique({
            where: {id},
            select: {is_active: true, id: true, status: true}
        })
        if(!post){
            throw new HttpException('This position post is not found', HttpStatus.BAD_REQUEST);
        }
        const dataUpdate = { ... data};
        if(typeof dataUpdate.status === 'string'){
            if(dataUpdate.status === 'Ngừng sử dụng') dataUpdate.is_active = false;
            if(dataUpdate.status === 'Đang sử dụng') dataUpdate.is_active = true
        }
        if(typeof dataUpdate.is_active === 'boolean'){
            dataUpdate.status = dataUpdate.is_active ? 'Đang sử dụng' : 'Ngừng sử dụng'
        }
        return this.prismaService.setting_Position_Posts.update({
            where: {id},
            data: dataUpdate
        })
    }
    async delete (id: string): Promise<Setting_Position_Posts>{
        return this.prismaService.setting_Position_Posts.update({
            where: {id},
            data: {status: 'Ngừng sử dụng', is_active: false}
        })
    }
}
