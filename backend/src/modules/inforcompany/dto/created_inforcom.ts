import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateInforCompanyDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  acronym_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  business_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  tax_idennumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  code_company?: string;

  

  @IsOptional()
  @IsDateString()
  date_stablish?: string;

  @IsOptional()
  @IsString()
  image_logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code_business?: string;

  @IsOptional()
  @IsDateString()
  date_of_issue?: string;

  @IsOptional()
  @IsString()
  place_of_issue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  unit_title?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fax?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string; // "đang theo dõi" | "ngừng theo dõi"...

  // parent_id: nếu bạn sửa schema thành String? thì DTO optional là hợp lý.
  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  organization_level?: string;

  // number_arrange trong schema là Int bắt buộc, nhưng nghiệp vụ thường để tự set.
  // DTO để optional, backend set default 0/1 nếu không truyền.
  @IsOptional()
  @IsInt()
  @Min(0)
  number_arrange?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  field_of_activity?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
