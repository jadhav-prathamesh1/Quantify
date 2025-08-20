import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { OwnerModule } from './owner/owner.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    StoresModule,
    RatingsModule,
    OwnerModule,
    UserModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
