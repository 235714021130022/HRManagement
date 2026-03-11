import {
    IsArray,
    IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecOtherCost } from './other_cost';
import { RecruitmentPlanDto } from './rec_plan';

export class CreateRecruitmentInforDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  recruitment_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  channel_cost?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  other_cost?: string;

  @IsOptional()
    @IsBoolean()
    is_active?: boolean;
    
  @IsOptional()
  @IsString()
  @MaxLength(300)
  internal_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  post_title?: string;

  @IsUUID()
  department_id: string;

  @IsUUID()
  rank_id: string;

  @IsUUID()
  work_location_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  type_of_job?: string;

  @IsOptional()
  @IsDateString()
  application_deadline?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary_from?: number;


  @Type(() => Number)
  @IsNumber()
  total_needed?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salary_to?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  salary_currency?: string;

  @IsString()
  position_post_id: string

  @IsOptional()
  @IsUUID()
  contact_person_id?: string;

    @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

   
    @IsOptional()
    @IsArray()
    @ValidateNested({each:true})
    @Type(() => RecOtherCost)
    other_costs?: RecOtherCost[]

    @IsArray()
    @IsOptional()
    @ValidateNested({each: true})
    @Type(() => RecruitmentPlanDto)
    plan?: RecruitmentPlanDto[]
}
