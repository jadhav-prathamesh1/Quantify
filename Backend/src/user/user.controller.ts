import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Dashboard Stats
  @Get('dashboard/:id')
  async getUserDashboard(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getUserDashboardStats(userId);
  }

  // Store Discovery
  @Get('stores')
  async getAllStores(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.findAllStores({
      search,
      category,
      rating: rating ? parseFloat(rating) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stores/:id')
  async getStore(@Param('id', ParseIntPipe) storeId: number) {
    return this.userService.getStoreDetails(storeId);
  }

  @Get('stores/:id/reviews')
  async getStoreReviews(
    @Param('id', ParseIntPipe) storeId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.getStoreReviews(storeId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('stores/:id/reviews')
  async addReview(
    @Param('id', ParseIntPipe) storeId: number,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    return this.userService.addReview(storeId, req.user.userId, createReviewDto);
  }

  // My Reviews
  @Get('reviews/:id')
  async getUserReviews(
    @Param('id', ParseIntPipe) userId: number,
    @Query('search') search?: string,
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userService.getUserReviews(userId, {
      search,
      rating: rating ? parseInt(rating, 10) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Patch('reviews/:id')
  async updateReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req: any,
  ) {
    return this.userService.updateReview(reviewId, req.user.userId, updateReviewDto);
  }

  @Delete('reviews/:id')
  async deleteReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Request() req: any,
  ) {
    return this.userService.deleteReview(reviewId, req.user.userId);
  }

  // Profile
  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getUserProfile(userId);
  }

  @Patch('profile/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.userService.updateUserProfile(userId, req.user.userId, updateUserDto);
  }
}
