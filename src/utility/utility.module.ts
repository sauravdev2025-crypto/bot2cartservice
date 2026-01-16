import { forwardRef, Module } from '@nestjs/common';
import es6Classes from './es6.classes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, PlatformUtilityModule, SystemModule } from '@servicelabsco/nestjs-utility-services';
import { AccessModule, AccessUtilityModule } from '@servicelabsco/slabs-access-manager';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(es6Classes.entities),
    forwardRef(() => BusinessModule),
    PlatformUtilityModule,
    AuthModule,
    SystemModule,
    AccessModule,
    AccessUtilityModule,
  ],
  controllers: es6Classes.controllers,
  providers: [...es6Classes.services, ...es6Classes.jobs, ...es6Classes.subscribers],
  exports: [...es6Classes.services, ...es6Classes.jobs],
})
export class UtilityModule {}
