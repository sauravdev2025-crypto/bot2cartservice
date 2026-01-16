import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, PlatformUtilityModule, SystemModule } from '@servicelabsco/nestjs-utility-services';
import { AccessModule } from '@servicelabsco/slabs-access-manager';
import { BusinessModule } from '../business/business.module';
import { UtilityModule } from '../utility/utility.module';
import es6Classes from './es6.classes';

@Module({
  imports: [
    TypeOrmModule.forFeature(es6Classes.entities),
    AccessModule,
    UtilityModule,
    PlatformUtilityModule,
    SystemModule,
    AuthModule,
    forwardRef(() => BusinessModule),
  ],
  controllers: es6Classes.controllers,
  providers: [...es6Classes.services, ...es6Classes.jobs, ...es6Classes.subscribers],
  exports: [...es6Classes.services, ...es6Classes.jobs],
})
export class ExternalModule {}
