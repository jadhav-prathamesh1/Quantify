import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  @Get('dashboard')
  getAdminDashboard() {
    return {
      message: 'Welcome to Admin Dashboard',
      role: 'admin',
    };
  }
}

@Controller('api/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
export class UserController {
  @Get('dashboard')
  getUserDashboard() {
    return {
      message: 'Welcome to User Dashboard',
      role: 'user',
    };
  }
}