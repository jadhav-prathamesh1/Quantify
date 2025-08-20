import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Status } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAllStores(params: {
    search?: string;
    status?: Status;
    ownerId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      status,
      ownerId,
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
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    const [field, direction] = sort.split(':');
    orderBy[field] = direction === 'desc' ? 'desc' : 'asc';

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      }),
      this.prisma.store.count({ where }),
    ]);

    // Calculate average rating for each store
    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratingStats = await this.prisma.rating.aggregate({
          where: { storeId: store.id },
          _avg: { rating: true },
          _count: true,
        });

        return {
          ...store,
          averageRating: ratingStats._avg.rating || 0,
          totalRatings: ratingStats._count,
        };
      })
    );

    return {
      data: storesWithRatings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneStore(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate rating statistics
    const ratingStats = await this.prisma.rating.aggregate({
      where: { storeId: id },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...store,
      averageRating: ratingStats._avg.rating || 0,
      totalRatings: ratingStats._count,
    };
  }

  async createStore(createStoreDto: CreateStoreDto, ownerId: number) {
    // Check if email already exists
    const existingStore = await this.prisma.store.findUnique({
      where: { email: createStoreDto.email },
    });

    if (existingStore) {
      throw new ConflictException('Store email already exists');
    }

    // Verify owner exists and has OWNER role
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (owner.role !== 'OWNER') {
      throw new BadRequestException('User must have OWNER role');
    }

    const store = await this.prisma.store.create({
      data: {
        ...createStoreDto,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    return {
      ...store,
      averageRating: 0,
      totalRatings: 0,
    };
  }

  async updateStore(id: number, updateStoreDto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // If email is being updated, check for conflicts
    if (updateStoreDto.email && updateStoreDto.email !== store.email) {
      const existingStore = await this.prisma.store.findUnique({
        where: { email: updateStoreDto.email },
      });

      if (existingStore) {
        throw new ConflictException('Store email already exists');
      }
    }

    const updatedStore = await this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
    });

    // Calculate rating statistics
    const ratingStats = await this.prisma.rating.aggregate({
      where: { storeId: id },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...updatedStore,
      averageRating: ratingStats._avg.rating || 0,
      totalRatings: ratingStats._count,
    };
  }

  async removeStore(id: number) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.prisma.store.delete({
      where: { id },
    });

    return { message: 'Store deleted successfully' };
  }

  async assignOwner(storeId: number, ownerId: number) {
    const [store, owner] = await Promise.all([
      this.prisma.store.findUnique({ where: { id: storeId } }),
      this.prisma.user.findUnique({ where: { id: ownerId } }),
    ]);

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    if (owner.role !== 'OWNER') {
      throw new BadRequestException('User must have OWNER role');
    }

    const updatedStore = await this.prisma.store.update({
      where: { id: storeId },
      data: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedStore;
  }
}
