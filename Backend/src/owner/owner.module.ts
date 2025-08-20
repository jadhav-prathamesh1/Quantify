import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, PrismaService],
  exports: [OwnerService],
})
export class OwnerModule {}
