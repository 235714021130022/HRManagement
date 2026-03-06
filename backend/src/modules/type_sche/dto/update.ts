import { PartialType } from '@nestjs/mapped-types';
import { CreateSchedulesTypeDto } from './create';

export class UpdateSchedulesTypeDto extends PartialType(CreateSchedulesTypeDto) {}