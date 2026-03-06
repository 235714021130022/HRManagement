import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTypeSchedulesLinkDto {
  @IsNotEmpty()
  @IsUUID()
  type_schedule_id: string;

  @IsOptional()
  @IsString()
  exam_link?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}