import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Stats for Owner
  async getDashboardStats(ownerId: number) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, status: true, role: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException('Access denied');
    }

    // Get owner's stores with ratings
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    // Calculate average rating across all stores
    let totalRatings = 0;
    let totalRatingSum = 0;
    let totalReviews = 0;

    stores.forEach(store => {
      store.ratings.forEach(rating => {
        totalRatingSum += rating.rating;
        totalRatings++;
      });
      totalReviews += store._count.ratings;
    });

    const averageRating = totalRatings > 0 ? (totalRatingSum / totalRatings).toFixed(1) : '0';

    return {
      totalStores: stores.length,
      averageRating: parseFloat(averageRating),
      totalReviews,
      status: owner.status,
      canAddStore: owner.status === 'ACTIVE' && stores.length < 2,
      maxStoresReached: stores.length >= 2,
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        averageRating: store.ratings.length > 0 
          ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1)
          : '0',
        totalReviews: store._count.ratings,
      })),
    };
  }

  // Dashboard Charts Data for Owner
  async getDashboardCharts(ownerId: number) {
    await this.verifyOwnerAccess(ownerId);

    // Get owner's stores
    const stores = await this.prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Reviews Over Time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reviewsOverTime = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      const reviewsCount = stores.reduce((total, store) => {
        const monthlyReviews = store.ratings.filter(rating => {
          const ratingDate = new Date(rating.createdAt);
          return ratingDate >= startOfMonth && ratingDate <= endOfMonth;
        });
        return total + monthlyReviews.length;
      }, 0);

      reviewsOverTime.push({
        date: monthName,
        value: reviewsCount,
      });
    }

    // Rating Distribution
    const ratingDistribution = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ];

    stores.forEach(store => {
      store.ratings.forEach(rating => {
        const ratingGroup = ratingDistribution.find(r => r.rating === rating.rating);
        if (ratingGroup) {
          ratingGroup.count++;
        }
      });
    });

    // Store Performance
    const storePerformance = stores.map(store => {
      const averageRating = store.ratings.length > 0 
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
        : 0;

      return {
        store: store.name,
        rating: parseFloat(averageRating.toFixed(1)),
        reviews: store.ratings.length,
      };
    });

    return {
      reviewsOverTime,
      ratingDistribution,
      storePerformance,
    };
  }

  // Get Stores for Owner
  async findOwnerStores(ownerId: number, params: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, sort = 'createdAt', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // Verify owner access
    await this.verifyOwnerAccess(ownerId);

    const where: any = { ownerId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              ratings: true,
            },
          },
        },
        orderBy: { [sort]: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    const storesWithStats = stores.map(store => ({
      ...store,
      averageRating: store.ratings.length > 0 
        ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1)
        : '0',
      totalReviews: store._count.ratings,
    }));

    return {
      stores: storesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create Store (max 2 per owner)
  async createStore(ownerId: number, createStoreDto: CreateStoreDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, status: true, role: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException('Access denied');
    }

    if (owner.status !== 'ACTIVE') {
      throw new ForbiddenException('Your account must be approved by an admin before you can add stores');
    }

    // Check store limit
    const existingStores = await this.prisma.store.count({
      where: { ownerId },
    });

    if (existingStores >= 2) {
      throw new ConflictException('You can only manage up to 2 stores');
    }

    // Check email uniqueness
    const existingStore = await this.prisma.store.findUnique({
      where: { email: createStoreDto.email },
    });

    if (existingStore) {
      throw new ConflictException('Store with this email already exists');
    }

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        ownerId,
      },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });
  }

  // Update Store
  async updateStore(ownerId: number, storeId: number, updateStoreDto: UpdateStoreDto) {
    await this.verifyStoreOwnership(ownerId, storeId);

    if (updateStoreDto.email) {
      const existingStore = await this.prisma.store.findFirst({
        where: {
          email: updateStoreDto.email,
          NOT: { id: storeId },
        },
      });

      if (existingStore) {
        throw new ConflictException('Store with this email already exists');
      }
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: updateStoreDto,
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });
  }

  // Delete Store
  async deleteStore(ownerId: number, storeId: number) {
    await this.verifyStoreOwnership(ownerId, storeId);

    return this.prisma.store.delete({
      where: { id: storeId },
    });
  }

  // Get Store Insights
  async getStoreInsights(ownerId: number, storeId: number) {
    await this.verifyStoreOwnership(ownerId, storeId);

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Ratings distribution
    const ratingsDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const count = store.ratings.filter(r => r.rating === rating).length;
      return { rating, count };
    });

    // Ratings trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ratingsTrend = await this.prisma.rating.groupBy({
      by: ['createdAt'],
      where: {
        storeId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format trend data by month
    const trendByMonth = ratingsTrend.reduce((acc: any, item) => {
      const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { 
          month, 
          totalRatings: 0, 
          sumRatings: 0 
        };
      }
      acc[month].totalRatings += item._count.id;
      acc[month].sumRatings += (item._avg.rating || 0) * item._count.id;
      return acc;
    }, {});

    const monthlyTrend = Object.values(trendByMonth).map((data: any) => ({
      month: data.month,
      averageRating: data.totalRatings > 0 ? (data.sumRatings / data.totalRatings).toFixed(1) : '0',
      count: data.totalRatings,
    }));

    // Top reviewers
    const topReviewers = store.ratings
      .reduce((acc: any[], rating) => {
        const existing = acc.find(r => r.userId === rating.userId);
        if (existing) {
          existing.ratingsCount++;
          existing.averageRating = ((existing.averageRating * (existing.ratingsCount - 1)) + rating.rating) / existing.ratingsCount;
        } else {
          acc.push({
            userId: rating.userId,
            name: rating.user.name,
            ratingsCount: 1,
            averageRating: rating.rating,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.ratingsCount - a.ratingsCount)
      .slice(0, 5);

    return {
      store: {
        id: store.id,
        name: store.name,
        totalRatings: store.ratings.length,
        averageRating: store.ratings.length > 0 
          ? (store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length).toFixed(1)
          : '0',
      },
      ratingsDistribution,
      ratingsTrend: monthlyTrend,
      topReviewers,
    };
  }

  // Get Reviews for Owner's Stores
  async getOwnerReviews(ownerId: number, params: {
    storeId?: number;
    search?: string;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    await this.verifyOwnerAccess(ownerId);

    const { storeId, search, rating, sort = 'createdAt', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      store: {
        ownerId,
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (rating) {
      where.rating = rating;
    }

    // Map sort values to proper Prisma orderBy
    let orderBy: any = { createdAt: 'desc' }; // default
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating_high':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_low':
        orderBy = { rating: 'asc' };
        break;
      case 'createdAt':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.rating.findMany({
        where,
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
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.rating.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Flag Review (for moderation)
  async flagReview(ownerId: number, reviewId: number, reason: string) {
    const review = await this.prisma.rating.findUnique({
      where: { id: reviewId },
      include: {
        store: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.store.ownerId !== ownerId) {
      throw new ForbiddenException('You can only flag reviews for your own stores');
    }

    // Note: In a real app, you might create a separate "flags" table
    // For now, we'll just add a comment to track this
    return this.prisma.rating.update({
      where: { id: reviewId },
      data: {
        comment: `${review.comment}\n\n[FLAGGED BY OWNER: ${reason}]`,
      },
    });
  }

  // Get/Update Owner Profile
  async getOwnerProfile(ownerId: number) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException('Access denied');
    }

    return owner;
  }

  async updateOwnerProfile(ownerId: number, updateOwnerDto: UpdateOwnerDto) {
    await this.verifyOwnerAccess(ownerId);

    return this.prisma.user.update({
      where: { id: ownerId },
      data: updateOwnerDto,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // Helper Methods
  private async verifyOwnerAccess(ownerId: number) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { role: true },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException('Access denied');
    }
  }

  private async verifyStoreOwnership(ownerId: number, storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== ownerId) {
      throw new ForbiddenException('You can only access your own stores');
    }
  }
}
