import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateInforCompanyDTO } from './dto/created_inforcom';
import { InforCompany } from '@prisma/client';

@Injectable()
export class InforcompanyService {
    constructor(private prismaService: PrismaService){}
    async createInfor(data: CreateInforCompanyDTO): Promise<InforCompany>{
        const {parent_id, date_stablish, date_of_issue, number_arrange, ... rest} = data;
        
        if(parent_id){
            const parent = await this.prismaService.inforCompany.findUnique({
                where: {id: parent_id},
                select: {id: true}
            })
            if(!parent){
                throw new HttpException('Company parent not found', HttpStatus.BAD_REQUEST)
            }
        }
        return this.prismaService.inforCompany.create({
            data: {
                ...rest,
                number_arrange: number_arrange ?? 0,
                date_of_issue: date_of_issue ? new Date(date_of_issue) : undefined,
                date_stablish: date_stablish ? new Date(date_stablish) : undefined,
                parent: parent_id ? { connect: {id :parent_id}} : undefined
            }
        })
    }   
}
