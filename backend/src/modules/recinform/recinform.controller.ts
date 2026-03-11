import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RecinformService } from './recinform.service';
import { CreateRecruitmentInforDto } from './dto/created_recinform';
import { filter } from 'rxjs';
import { RecruitmentInforFilterType } from './dto/recinform_filter_type';
import { RecruitmentInforPaginType } from './dto/recinform_pagin_type';
import { UpdateRecruitmentInforDto } from './dto/updated_recinform';
import { RecruitmentCostQueryDto } from './dto/cost-query';
import { RecruitmentPlanQueryDto } from './dto/plan-query';
import { Recruitment_Infor } from '@prisma/client';

    @Controller('recinform')
    export class RecinformController {
        constructor(private recInforService: RecinformService){}
        @Post()
        create (@Body() data: CreateRecruitmentInforDto){
            return this.recInforService.create(data);
        }

    @Get()
    getAll (@Query() filter:RecruitmentInforFilterType): Promise<RecruitmentInforPaginType>{
        return this.recInforService.getAll(filter);
    }

    @Get('cost/summary')
    getCostSummary(@Query() query: RecruitmentCostQueryDto) {
        return this.recInforService.getCostSummary(query);
    }

    @Get('plan/summary')
    getPlanSummary(@Query() query: RecruitmentPlanQueryDto) {
        return this.recInforService.getPlanSummary(query);
    }

    @Get(':id')
    getByID (@Param('id') id: string): Promise<Recruitment_Infor|null>{
        return this.recInforService.getByID(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: UpdateRecruitmentInforDto): Promise<Recruitment_Infor | null>{
        return this.recInforService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id:string):Promise<Recruitment_Infor>{
        return this.recInforService.delete(id);
    }

}
