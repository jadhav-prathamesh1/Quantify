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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Status } from '@prisma/client';

@Controller('api/admin/stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: Status,
    @Query('ownerId') ownerId?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storesService.findAllStores({
      search,
      status,
      ownerId: ownerId ? parseInt(ownerId, 10) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.storesService.createStore(createStoreDto, ownerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOneStore(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(id, updateStoreDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.removeStore(id);
  }

  @Patch(':id/assign-owner')
  async assignOwner(
    @Param('id', ParseIntPipe) storeId: number,
    @Body('ownerId', ParseIntPipe) ownerId: number,
  ) {
    return this.storesService.assignOwner(storeId, ownerId);
  }
}
