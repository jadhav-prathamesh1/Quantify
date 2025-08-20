import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Get total counts
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
    ]);

    // Get role distribution
    const roleDistribution = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // Get ratings trend for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ratingsTrend = await this.prisma.rating.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transform the data
    const ratingsTrendFormatted = ratingsTrend.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      ratings: item._count.id,
    }));

    const roleDistributionFormatted = roleDistribution.map((item) => ({
      role: item.role,
      count: item._count.role,
      color: this.getRoleColor(item.role),
    }));

    return {
      totalUsers,
      totalStores,
      totalRatings,
      ratingsTrend: ratingsTrendFormatted,
      roleDistribution: roleDistributionFormatted,
    };
  }

  private getRoleColor(role: string): string {
    const colors = {
      USER: '#3b82f6',
      OWNER: '#8b5cf6',
      ADMIN: '#10b981',
    };
    return colors[role] || '#6b7280';
  }

  async getRatingsDistribution() {
    const distribution = await this.prisma.rating.groupBy({
      by: ['rating'],
      _count: {
        rating: true,
      },
      orderBy: {
        rating: 'asc',
      },
    });

    return distribution.map((item) => ({
      star: item.rating,
      count: item._count.rating,
    }));
  }

  async getRatingsTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await this.prisma.rating.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return trend.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      ratings: item._count.id,
    }));
  }
}
