import { Module } from '@nestjs/common';
import { PlatformUtilityModule } from '@servicelabsco/nestjs-utility-services';

@Module({
  imports: [PlatformUtilityModule],
  providers: [],
  exports: [],
})
export class CommonModule {}
