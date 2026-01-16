import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ExternalAccessService } from '../services/external.access.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * create controller for ExternalApiLog
 * @export
 * @class ExternalApiLogController
 */
@ApiTags('v1')
@Controller('v1')
export class ExternalApiController {
  constructor(protected readonly externalAccessService: ExternalAccessService) {}

  @Get('test')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'test' })
  @ApiResponse({ status: 200, description: 'Returns a the hello world' })
  async welcome() {
    await this.externalAccessService.validateAccess();
    return {
      message: 'Hello world!!',
    };
  }
}
