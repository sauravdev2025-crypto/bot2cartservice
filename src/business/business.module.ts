import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, PlatformUtilityModule, SystemModule } from '@servicelabsco/nestjs-utility-services';
import { AccessModule, AccessUtilityModule } from '@servicelabsco/slabs-access-manager';
import { SocketModule } from '../socket/socket.module';
import { UtilityModule } from '../utility/utility.module';
import es6Classes from './es6.classes';

@Module({
  imports: [
    TypeOrmModule.forFeature(es6Classes.entities),
    PlatformUtilityModule,
    AuthModule,
    SystemModule,
    AccessModule,
    AccessUtilityModule,
    PlatformUtilityModule,
    forwardRef(() => UtilityModule),
    forwardRef(() => SocketModule),
  ],
  controllers: es6Classes.controllers,
  providers: [...es6Classes.services, ...es6Classes.jobs, ...es6Classes.subscribers],
  exports: [...es6Classes.services, ...es6Classes.jobs],
})
export class BusinessModule {}
