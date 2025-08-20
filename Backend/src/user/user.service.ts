import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserDashboardStats(userId: number) {
    // Verify user exists and is a USER role
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'USER' },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's ratings with store information
    const userRatings = await this.prisma.rating.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            category: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = userRatings.length;
    const averageRating = totalReviews > 0 
      ? userRatings.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;
    
    // Get unique stores the user has rated
    const storesRated = new Set(userRatings.map(r => r.storeId)).size;
    
    // Get recent reviews (last 5)
    const recentReviews = userRatings.slice(0, 5).map(rating => ({
      id: rating.id,
      storeName: rating.store.name,
      storeCategory: rating.store.category,
      rating: rating.rating,
      comment: rating.comment || '',
      createdAt: rating.createdAt.toISOString(),
    }));

    // Get monthly statistics (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyReviews = await this.prisma.rating.count({
      where: {
        userId,
        createdAt: {
          gte: currentMonth,
        }
      }
    });

    // Get recent activity (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentActivity = await this.prisma.rating.count({
      where: {
        userId,
        createdAt: {
          gte: lastWeek,
        }
      }
    });

    // Get favorite stores (stores with rating >= 4)
    const favoriteStores = userRatings.filter(rating => rating.rating >= 4).length;

    // Calculate activity time range for recent reviews
    const oldestRecentReview = recentReviews.length > 0 
      ? new Date(recentReviews[recentReviews.length - 1].createdAt)
      : new Date();
    const newestRecentReview = recentReviews.length > 0 
      ? new Date(recentReviews[0].createdAt)
      : new Date();
    
    // Calculate days between oldest and newest recent review
    const daysDiff = Math.ceil((newestRecentReview.getTime() - oldestRecentReview.getTime()) / (1000 * 60 * 60 * 24));
    const activityTimeframe = daysDiff <= 1 ? 'Today' : daysDiff <= 7 ? `Last ${daysDiff} days` : `Last ${Math.ceil(daysDiff / 7)} weeks`;

    return {
      user: {
        name: user.name,
        email: user.email,
        joinDate: user.createdAt.toISOString(),
        memberSince: this.calculateMemberSince(user.createdAt),
      },
      stats: {
        totalReviews: totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        favoriteStores: favoriteStores,
        storesVisited: storesRated,
        monthlyReviews: monthlyReviews,
        recentActivity: recentActivity,
      },
      recentReviews: recentReviews,
      meta: {
        currentDate: new Date().toISOString(),
        activityTimeframe: recentReviews.length > 0 ? activityTimeframe : 'No recent activity',
        welcomeMessage: this.generateWelcomeMessage(user.name, totalReviews),
        dashboardSubtitle: this.generateDashboardSubtitle(totalReviews, recentActivity),
      },
    };
  }

  private calculateMemberSince(joinDate: Date): string {
    const now = new Date();
    const diff = now.getTime() - joinDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  }

  private generateWelcomeMessage(name: string, totalReviews: number): string {
    if (totalReviews === 0) return `Welcome to Quantify, ${name}! 🎉`;
    if (totalReviews < 5) return `Welcome back, ${name}! 👋`;
    if (totalReviews < 20) return `Great to see you, ${name}! ⭐`;
    return `Welcome back, Review Expert ${name}! 🏆`;
  }

  private generateDashboardSubtitle(totalReviews: number, recentActivity: number): string {
    if (totalReviews === 0) return 'Start your review journey by discovering amazing stores';
    if (recentActivity === 0) return 'Your review activity overview - time to explore new places!';
    if (recentActivity === 1) return 'You\'ve been active recently - here\'s your review overview';
    return `You've been quite active with ${recentActivity} recent reviews!`;
  }

  async findAllStores(params: {
    search?: string;
    category?: string;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      category,
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
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Get stores with ratings aggregation
    const stores = await this.prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: { rating: true },
        },
        _count: {
          select: { ratings: true },
        },
      },
      skip,
      take: limit,
      orderBy: this.buildStoreOrderBy(sort),
    });

    const total = await this.prisma.store.count({ where });

    // Calculate average ratings and filter by rating if needed
    const storesWithStats = stores.map(store => {
      const avgRating = store.ratings.length > 0
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
        : 0;

      return {
        id: store.id,
        name: store.name,
        category: store.category,
        location: store.address, // Frontend expects 'location'
        address: store.address,
        phone: store.phone,
        email: store.email,
        averageRating: Math.round(avgRating * 10) / 10, // Frontend expects 'averageRating'
        totalRatings: store._count.ratings, // Frontend expects 'totalRatings'
        description: `${store.category} store located in ${store.address}`,
        createdAt: store.createdAt,
      };
    }).filter(store => {
      if (rating) {
        return store.averageRating >= rating;
      }
      return true;
    });

    return {
      stores: storesWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // Frontend expects 'totalPages'
      },
      // Also provide flat properties for backward compatibility
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStoreDetails(storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: { name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
        _count: {
          select: { ratings: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const avgRating = store.ratings.length > 0
      ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length
      : 0;

    // Calculate ratings distribution
    const ratingsDistribution = [1, 2, 3, 4, 5].map(rating => {
      const count = store.ratings.filter(r => r.rating === rating).length;
      return {
        rating,
        count,
        percentage: store.ratings.length > 0 ? Math.round((count / store.ratings.length) * 100) : 0,
      };
    });

    return {
      id: store.id,
      name: store.name,
      category: store.category,
      location: store.address, // Frontend expects 'location'
      address: store.address,
      phone: store.phone,
      email: store.email,
      owner: store.owner,
      description: `${store.category} store located in ${store.address}`,
      averageRating: Math.round(avgRating * 10) / 10, // Frontend expects 'averageRating'
      totalRatings: store._count.ratings, // Frontend expects 'totalRatings'
      ratingsDistribution,
      createdAt: store.createdAt,
    };
  }

  async getStoreReviews(storeId: number, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const reviews = await this.prisma.rating.findMany({
      where: { storeId },
      include: {
        user: {
          select: { name: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.rating.count({
      where: { storeId },
    });

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.userId,
          name: review.user.name,
          email: review.user.name.toLowerCase().replace(/\s+/g, '') + '@example.com', // Placeholder email
        },
        // Also provide flat properties for backward compatibility
        userName: review.user.name,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // Frontend expects 'totalPages'
      },
      // Also provide flat properties for backward compatibility  
      totalPages: Math.ceil(total / limit),
    };
  }

  async addReview(storeId: number, userId: number, createReviewDto: CreateReviewDto) {
    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if user has already reviewed this store
    const existingReview = await this.prisma.rating.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this store');
    }

    const review = await this.prisma.rating.create({
      data: {
        ...createReviewDto,
        storeId,
        userId,
      },
      include: {
        store: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
    });

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      storeName: review.store.name,
      userName: review.user.name,
      createdAt: review.createdAt,
    };
  }

  async getUserReviews(userId: number, params: {
    search?: string;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      rating,
      sort = 'createdAt',
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (search) {
      where.store = {
        name: { contains: search, mode: 'insensitive' },
      };
    }

    if (rating) {
      where.rating = rating;
    }

    const reviews = await this.prisma.rating.findMany({
      where,
      include: {
        store: {
          select: { name: true, category: true },
        },
      },
      skip,
      take: limit,
      orderBy: this.buildReviewOrderBy(sort),
    });

    const total = await this.prisma.rating.count({ where });

    return {
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.createdAt, // Using createdAt for updatedAt for simplicity
        store: {
          id: review.storeId,
          name: review.store.name,
          location: review.store.category, // Using category as location for now
        },
        // Also provide flat properties for backward compatibility
        storeName: review.store.name,
        storeCategory: review.store.category,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit), // Frontend expects 'totalPages'
      },
    };
  }

  async updateReview(reviewId: number, userId: number, updateReviewDto: UpdateReviewDto) {
    // Check if review exists and belongs to user
    const review = await this.prisma.rating.findUnique({
      where: { id: reviewId },
      include: {
        store: {
          select: { name: true },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    const updatedReview = await this.prisma.rating.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        store: {
          select: { name: true },
        },
      },
    });

    return {
      id: updatedReview.id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      storeName: updatedReview.store.name,
      createdAt: updatedReview.createdAt,
    };
  }

  async deleteReview(reviewId: number, userId: number) {
    // Check if review exists and belongs to user
    const review = await this.prisma.rating.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.rating.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user badges/achievements
    const ratingsCount = await this.prisma.rating.count({
      where: { userId },
    });

    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      select: { comment: true },
    });

    const avgCommentLength = ratings.length > 0
      ? ratings.filter(r => r.comment).reduce((sum, r) => sum + (r.comment?.length || 0), 0) / ratings.filter(r => r.comment).length
      : 0;

    const badges = [];
    if (ratingsCount > 10) {
      badges.push({ name: 'Top Reviewer', description: 'Submitted more than 10 reviews' });
    }
    if (avgCommentLength > 100) {
      badges.push({ name: 'Quality Reviewer', description: 'Average review length over 100 characters' });
    }

    return {
      ...user,
      stats: {
        totalReviews: ratingsCount,
        averageCommentLength: Math.round(avgCommentLength),
      },
      badges,
    };
  }

  async updateUserProfile(userId: number, requestUserId: number, updateUserDto: UpdateUserDto) {
    if (userId !== requestUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId, role: 'USER' },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        address: updateUserDto.address,
        phone: updateUserDto.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        role: true,
      },
    });

    return updatedUser;
  }

  private buildStoreOrderBy(sort: string) {
    switch (sort) {
      case 'name':
        return { name: 'asc' as const };
      case 'recent':
        return { createdAt: 'desc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  }

  private buildReviewOrderBy(sort: string) {
    switch (sort) {
      case 'rating':
        return { rating: 'desc' as const };
      case 'rating_asc':
        return { rating: 'asc' as const };
      case 'date_asc':
        return { createdAt: 'asc' as const };
      default:
        return { createdAt: 'desc' as const };
    }
  }
}
