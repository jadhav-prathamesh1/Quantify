import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('ratings/distribution')
  async getRatingsDistribution() {
    return this.adminService.getRatingsDistribution();
  }

  @Get('ratings/trend')
  async getRatingsTrend(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.adminService.getRatingsTrend(daysNumber);
  }
}
