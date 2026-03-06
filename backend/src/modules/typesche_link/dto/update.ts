import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeSchedulesLinkDto } from './create';

export class UpdateTypeSchedulesLinkDto extends PartialType(CreateTypeSchedulesLinkDto) {}