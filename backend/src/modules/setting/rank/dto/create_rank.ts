import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  MaxLength
} from 'class-validator';

export class CreateRankDTO {

  @IsOptional()
  @IsString()
  @MaxLength(50)
  rank_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_rank?: string;

  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}