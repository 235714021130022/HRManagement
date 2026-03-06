import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  candidate_id: string;

  @IsUUID()
  @IsNotEmpty()
  recruitment_infor_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

    @IsOptional()
  @IsString()
  @MaxLength(100)
  status: string;

}