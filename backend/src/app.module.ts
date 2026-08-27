import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { SellerDashboardModule } from './modules/dashboard/seller-dashboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { UploadModule } from './modules/upload/upload.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    WishlistModule,
    ReviewsModule,
    MerchantsModule,
    SellerDashboardModule,
    AdminModule,
    ChatModule,
    NotificationsModule,
    DeliveryModule,
    UploadModule,
    WalletModule,
    CouponsModule,
    ReferralsModule,
    AnalyticsModule,
    SupportModule,
  ],
})
export class AppModule {}
