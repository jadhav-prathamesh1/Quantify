import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
