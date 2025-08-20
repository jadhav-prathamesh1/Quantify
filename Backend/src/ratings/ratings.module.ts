import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, PrismaService],
  exports: [RatingsService],
})
export class RatingsModule {}
