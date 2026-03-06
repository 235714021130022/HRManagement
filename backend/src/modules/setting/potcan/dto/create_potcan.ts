import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePotentialTypeDTO {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}