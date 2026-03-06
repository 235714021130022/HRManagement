import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateInforCompanyDTO } from './dto/created_inforcom';
import { InforCompany } from '@prisma/client';
import { InforcompanyService } from './inforcompany.service';
import { InformCompanyFilterType } from './dto/inforcom_filter_type';
import { InformCompanyPaginType } from './dto/inforcom_pagin_type';
import { UpdateInforCompanyDTO } from './dto/updated_inforcom';

@Controller('inforcompany')
export class InforcompanyController {
    constructor(private inforCom: InforcompanyService){}
    @Post()
    createInfor(@Body() data: CreateInforCompanyDTO): Promise<InforCompany>{
        return this.inforCom.createInfor(data);
    }

    @Get()
    getAll(@Query() params: InformCompanyFilterType): Promise<InformCompanyPaginType>{
        return this.inforCom.getAll(params);
    }

    @Get(':id')
    getByID(@Param('id') id: string): Promise<InforCompany | null>{
        return this.inforCom.getByID(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: UpdateInforCompanyDTO): Promise<InforCompany>{
        return this.inforCom.updateInform(id, body);
    }

    @Delete(':id') 
    delete (@Param('id') id: string): Promise<InforCompany>{
        return this.inforCom.deleteInform(id);
    }
}
