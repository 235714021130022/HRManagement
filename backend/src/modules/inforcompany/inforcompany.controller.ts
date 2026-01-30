import { Body, Controller, Post } from '@nestjs/common';
import { CreateInforCompanyDTO } from './dto/created_inforcom';
import { InforCompany } from '@prisma/client';
import { InforcompanyService } from './inforcompany.service';

@Controller('inforcompany')
export class InforcompanyController {
    constructor(private inforCom: InforcompanyService){}
    @Post()
    createInfor(@Body() data: CreateInforCompanyDTO): Promise<InforCompany>{
        return this.inforCom.createInfor(data);
    }
}
