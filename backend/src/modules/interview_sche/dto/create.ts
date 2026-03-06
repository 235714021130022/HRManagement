import { IsOptional, IsString, IsUUID, IsInt, IsDateString, IsArray } from 'class-validator';

export class CreateInterviewScheduleDto {
  @IsOptional()
  @IsString()
  sche_code?: string;

  @IsOptional()
  @IsDateString()
  interview_date?: Date;

  @IsOptional()
  @IsString()
  interview_location?: string;

  @IsOptional()
  @IsString()
  interview_room?: string;

  @IsInt()
  time_duration: number;

  @IsOptional()
  @IsDateString()
  times?: Date;

  @IsOptional()
  @IsUUID()
  type_schedule_id?: string;

  @IsOptional()
  @IsUUID()
  evaluation_id?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  interviewer_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  candidate_ids?: string[];
}