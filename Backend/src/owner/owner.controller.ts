import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req, 
  ParseIntPipe 
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OwnerService } from './owner.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Controller('api/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // Dashboard Stats
  @Get('dashboard/:id')
  async getDashboardStats(@Param('id', ParseIntPipe) ownerId: number) {
    return this.ownerService.getDashboardStats(ownerId);
  }

  // Dashboard Charts Data
  @Get('dashboard/:id/charts')
  async getDashboardCharts(@Param('id', ParseIntPipe) ownerId: number) {
    return this.ownerService.getDashboardCharts(ownerId);
  }

  // Shop Management
  @Get('shops/:ownerId')
  async getOwnerStores(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ownerService.findOwnerStores(ownerId, {
      search,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('shops')
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.ownerService.createStore(ownerId, createStoreDto);
  }

  @Patch('shops/:id')
  async updateStore(
    @Param('id', ParseIntPipe) storeId: number,
    @Body() updateStoreDto: UpdateStoreDto,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.ownerService.updateStore(ownerId, storeId, updateStoreDto);
  }

  @Delete('shops/:id')
  async deleteStore(
    @Param('id', ParseIntPipe) storeId: number,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.ownerService.deleteStore(ownerId, storeId);
  }

  // Insights
  @Get('insights/:shopId')
  async getStoreInsights(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.ownerService.getStoreInsights(ownerId, shopId);
  }

  @Get('insights/:shopId/reviewers')
  async getTopReviewers(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    const insights = await this.ownerService.getStoreInsights(ownerId, shopId);
    return { topReviewers: insights.topReviewers };
  }

  // Reviews
  @Get('reviews/:ownerId')
  async getOwnerReviews(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Query('storeId') storeId?: string,
    @Query('search') search?: string,
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ownerService.getOwnerReviews(ownerId, {
      storeId: storeId ? parseInt(storeId, 10) : undefined,
      search,
      rating: rating ? parseInt(rating, 10) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('reviews/:id/flag')
  async flagReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body('reason') reason: string,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.ownerService.flagReview(ownerId, reviewId, reason);
  }

  // Profile
  @Get('profile/:id')
  async getOwnerProfile(@Param('id', ParseIntPipe) ownerId: number) {
    return this.ownerService.getOwnerProfile(ownerId);
  }

  @Patch('profile/:id')
  async updateOwnerProfile(
    @Param('id', ParseIntPipe) ownerId: number,
    @Body() updateOwnerDto: UpdateOwnerDto,
  ) {
    return this.ownerService.updateOwnerProfile(ownerId, updateOwnerDto);
  }

  // Legacy dashboard endpoint for compatibility
  @Get('dashboard')
  getOwnerDashboard() {
    return {
      message: 'Welcome to Store Owner Dashboard - Use /api/owner/dashboard/:id for detailed stats',
      role: 'owner',
    };
  }
}
