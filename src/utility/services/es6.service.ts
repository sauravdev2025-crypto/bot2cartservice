import { Injectable } from '@nestjs/common';

import { PlatformUtility } from '@servicelabsco/nestjs-utility-services';

/**
 * this would get all the services which is part of the given module
 * @export
 * @class Es6Service
 */
@Injectable()
export class Es6Service {
  private services = {};

  constructor() {
    this.alignServices();
    this.setServices();
  }

  /**
   * this would assign all the services which is defined
   * @memberof Es6Service
   */
  alignServices() {
    this.services = {};
  }

  /**
   * assign the services service to the local property
   * @memberof Es6Service
   */
  setServices() {
    PlatformUtility.setServices(this.services);
  }
}
