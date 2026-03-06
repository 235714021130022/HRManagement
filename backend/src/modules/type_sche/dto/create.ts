import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSchedulesTypeDto {

  @IsOptional()
  @IsString()
  @MaxLength(50)
  st_code?: string;


  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  type_name: string;


  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}