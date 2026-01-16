import { Injectable } from '@nestjs/common';
import { PlatformUtility } from '@servicelabsco/nestjs-utility-services';
import entityConstants = require('./config/entity.constants');

@Injectable()
export class AppService {
  /**
   * Creates an instance of AppService.
   * @memberof AppService
   */
  constructor() {
    this.setEntities();
  }

  /**
   * set the constants for entities
   * @memberof AppService
   */
  setEntities() {
    global.console.log('setting up @servicelabsco/sl-communication-services: ', Object.keys(entityConstants).length);
    PlatformUtility.setEntities(entityConstants);
  }

  getHello() {
    return { hello: 'Communication World' };
  }
}
