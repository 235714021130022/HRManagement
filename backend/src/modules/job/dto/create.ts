import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, IsUUID, IsInt } from 'class-validator';

export class CreateJobDto {
  @IsOptional()
  @IsString()
  job_code?: string;

  @IsOptional()
  @IsString()
  name_job?: string;

  @IsOptional()
  @IsString()
  description_job?: string;

  @IsOptional()
  @IsString()
  type_job?: string;

  @IsOptional()
  @IsString()
  result_job?: string;

  @IsUUID()
  employee_id: string;

  @IsOptional()
  @IsDateString()
  deadline?: Date;

  @IsOptional()
  @IsBoolean()
  remind_enabled?: boolean;

  @IsOptional()
  @IsInt()
  remind_before_minutes?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  candidate_ids?: string[];
}