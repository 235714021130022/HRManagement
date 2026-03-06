import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Setting_Potential_Type } from '@prisma/client';
import { CreatePotentialTypeDTO } from './dto/create_potcan';
import { PotentialFilterType } from './dto/filter_type';
import { PotentialPaginType } from './dto/pagin_type';
import { UpdatePotentialTypeDTO } from './dto/update_potcan';
import { PotcanService } from './potcan.service';

@Controller('potcan')
export class PotcanController {
    constructor(private potentialService: PotcanService){}

    @Post()
    create(@Body() body: CreatePotentialTypeDTO): Promise<Setting_Potential_Type>{
        return this.potentialService.create(body);
    }

    @Get()
    getAll(@Query() params: PotentialFilterType): Promise<PotentialPaginType>{
        return this.potentialService.getAll(params);
    }

    @Get(':id')
    getByID(@Param('id') id:string): Promise<Setting_Potential_Type | null>{
        return this.potentialService.getByID(id);
    }

    @Put(':id')
    update(
        @Param('id') id:string,
        @Body() body: UpdatePotentialTypeDTO
    ): Promise<Setting_Potential_Type>{
        return this.potentialService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id:string): Promise<Setting_Potential_Type>{
        return this.potentialService.delete(id);
    }
}
