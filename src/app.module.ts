import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AdminAuthController,
  AuthModule,
  BasicAuthMiddleware,
  CommonModule,
  JwtMiddleware,
  PlatformUtilityModule,
  RestrictedMiddleware,
  ShutdownService,
  SystemModule,
  WorkerService,
} from '@servicelabsco/nestjs-utility-services';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as readOrmconfig from './config/read.typeorm.config';
import * as ormconfig from './config/typeorm.config';

import { AccessModule, AccessUtilityModule, BusinessMiddleware } from '@servicelabsco/slabs-access-manager';
import { CommandModule } from 'nestjs-command';
import { BusinessModule } from './business/business.module';
import { SocketModule } from './socket/socket.module';
import { UtilityModule } from './utility/utility.module';
import queueConfig = require('./config/queue.config');

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    TypeOrmModule.forRoot(readOrmconfig),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot(queueConfig),
    SocketModule,
    CommandModule,
    UtilityModule,
    BusinessModule,
    AccessModule,
    CommonModule,
    AuthModule,
    SystemModule,
    PlatformUtilityModule,
    AccessUtilityModule,
  ],
  controllers: [AppController, AdminAuthController],
  providers: [AppService, WorkerService, ShutdownService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer.apply(BasicAuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer.apply(RestrictedMiddleware).forRoutes({ path: 'api/*', method: RequestMethod.ALL });
    consumer.apply(BusinessMiddleware).forRoutes({ path: 'api/b/*', method: RequestMethod.ALL });
  }
}
