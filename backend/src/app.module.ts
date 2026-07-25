import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { InvoicesModule } from './invoices/invoices.module';
import { FinanceModule } from './finance/finance.module';
import { GstModule } from './gst/gst.module';
import { QueueModule } from './queue/queue.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    ProductsModule,
    InvoicesModule,
    FinanceModule,
    GstModule,
    QueueModule,
    PurchasesModule,
  ],
})
export class AppModule {}
