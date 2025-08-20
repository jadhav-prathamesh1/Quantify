import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateOwnerDto {
  @IsString()
  @IsOptional()
  @MaxLength(60)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(400)
  address?: string;
}
