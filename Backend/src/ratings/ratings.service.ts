import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async findAllRatings(params: {
    search?: string;
    storeId?: number;
    userId?: number;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      storeId,
      userId,
      rating,
      sort = 'createdAt',
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (rating) {
      where.rating = rating;
    }

    // Build orderBy clause
    const orderBy: any = {};
    const [field, direction] = sort.split(':');
    orderBy[field] = direction === 'desc' ? 'desc' : 'asc';

    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
            },
          },
        },
      }),
      this.prisma.rating.count({ where }),
    ]);

    return {
      data: ratings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneRating(id: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async createRating(createRatingDto: CreateRatingDto, userId: number, storeId: number) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if user already rated this store
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        userId,
        storeId,
      },
    });

    if (existingRating) {
      throw new ConflictException('User has already rated this store');
    }

    const rating = await this.prisma.rating.create({
      data: {
        ...createRatingDto,
        userId,
        storeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return rating;
  }

  async updateRating(id: number, updateRatingDto: UpdateRatingDto) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: updateRatingDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedRating;
  }

  async removeRating(id: number) {
    const rating = await this.prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    await this.prisma.rating.delete({
      where: { id },
    });

    return { message: 'Rating deleted successfully' };
  }

  async getRatingAnalytics(storeId?: number) {
    const where = storeId ? { storeId } : {};

    const [totalRatings, averageRating, ratingDistribution] = await Promise.all([
      this.prisma.rating.count({ where }),
      this.prisma.rating.aggregate({
        where,
        _avg: { rating: true },
      }),
      this.prisma.rating.groupBy({
        by: ['rating'],
        where,
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      }),
    ]);

    return {
      totalRatings,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }
}
