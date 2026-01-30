import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import { GenderEmployee } from "@prisma/client";
export class UpdatedEmployeeDTO {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  employee_name?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsEnum(GenderEmployee)
  gender?: GenderEmployee;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  work_unit?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  job_title?: string;

  @IsOptional()
  @IsString()
  director_id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status!: string;

  @IsOptional()
  @IsDateString()
  first_day_of_work?: string;

  @IsOptional()
  @IsDateString()
  official_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone_unit?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email_unit?: string;

  @IsEmail()
  @MaxLength(100)
  email_account!: string;

  // Class-validator có IsPhoneNumber nhưng cần country code, nếu bạn dùng số VN dạng 0xxx
  // thì để IsString + regex là dễ nhất. Mình để IsString đơn giản.
  @IsString()
  @MaxLength(15)
  phone_account!: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}