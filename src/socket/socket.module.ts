import { Module } from '@nestjs/common';
import { AuthModule, PlatformUtilityModule } from '@servicelabsco/nestjs-utility-services';
import es6Classes from './es6.classes';

@Module({
  imports: [AuthModule, PlatformUtilityModule],
  providers: [...es6Classes.gateways, ...es6Classes.services],
  exports: [...es6Classes.services, ...es6Classes.gateways],
})
export class SocketModule {}
