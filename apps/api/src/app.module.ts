import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { PrismaModule } from './database/prisma.module';
import { DevicesModule } from './devices/devices.module';
import { RepairOrdersModule } from './repair-orders/repair-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ClientsModule,
    DevicesModule,
    RepairOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}