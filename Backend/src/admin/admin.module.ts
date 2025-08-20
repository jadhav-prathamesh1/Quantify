import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminController as DashboardAdminController, UserController } from '../users/dashboard.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [AdminController, DashboardAdminController, UserController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}
