import { 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsBoolean, 
  MaxLength 
} from "class-validator";

export class CreatePositionPostDTO {

  @IsOptional()
  @IsString()
  @MaxLength(50)
  position_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_post?: string;

  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @IsOptional()
  @IsString()
  description_post?: string;

  @IsOptional()
  @IsString()
  requirements_post?: string;

  @IsOptional()
  @IsString()
  benefits_post?: string;

  @IsOptional()
  @IsUUID()
  Setting_Process_Recruitment_id?: string;

  @IsOptional()
  @IsBoolean()
  auto_rotation?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_eli_candidate?: boolean;

  @IsOptional()
  @IsBoolean()
  auto_near?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
