import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateSettingEmailOtherDto } from './dto/create';
import { SettingEmailOtherFilterType } from './dto/filter_type';
import { SettingEmailOtherPaginType } from './dto/pagin_type';
import { UpdateSettingEmailOtherDto } from './dto/update';
import { SendEmailService } from './send_email.service';
import { SettingEmail } from '@prisma/client';
@Controller('send-email')
export class SendEmailController {
  constructor(private readonly sendEmailService: SendEmailService) {}

  @Post()
  create(
    @Body() data: CreateSettingEmailOtherDto,
  ): Promise<SettingEmail> {
    return this.sendEmailService.create(data);
  }

  @Get()
  getAll(
    @Query() filter: SettingEmailOtherFilterType,
  ): Promise<SettingEmailOtherPaginType> {
    return this.sendEmailService.getAll(filter);
  }

  @Get(':id')
  getByID(
    @Param('id') id: string,
  ): Promise<SettingEmail> {
    return this.sendEmailService.getByID(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateSettingEmailOtherDto,
  ): Promise<SettingEmail> {
    return this.sendEmailService.update(id, data);
  }

  @Delete(':id')
  delete(
    @Param('id') id: string,
  ): Promise<SettingEmail> {
    return this.sendEmailService.delete(id);
  }
}