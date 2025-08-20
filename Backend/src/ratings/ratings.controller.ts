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
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/admin/ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('storeId') storeId?: string,
    @Query('userId') userId?: string,
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingsService.findAllRatings({
      search,
      storeId: storeId ? parseInt(storeId, 10) : undefined,
      userId: userId ? parseInt(userId, 10) : undefined,
      rating: rating ? parseInt(rating, 10) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  async create(
    @Body() createRatingDto: CreateRatingDto,
    @Query('userId', ParseIntPipe) userId: number,
    @Query('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.ratingsService.createRating(createRatingDto, userId, storeId);
  }

  @Get('analytics')
  async getAnalytics(@Query('storeId') storeId?: string) {
    return this.ratingsService.getRatingAnalytics(
      storeId ? parseInt(storeId, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.findOneRating(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.updateRating(id, updateRatingDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.removeRating(id);
  }
}
