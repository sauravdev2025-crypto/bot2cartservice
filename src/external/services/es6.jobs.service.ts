import { Injectable } from '@nestjs/common';
import { ExternalApiLogJob } from '../jobs/external.api.log.job';
import { PlatformUtility } from '@servicelabsco/nestjs-utility-services';

/**
 * this would get all the jobs which is part of the given module
 * @export
 * @class Es6JobsService
 */
@Injectable()
export class Es6JobsService {
  private jobs = {};

  constructor(private readonly externalApiLogJob: ExternalApiLogJob) {
    this.alignJobs();
    this.setJobs();
  }

  /**
   * this would assign all the jobs which is defined
   * @memberof Es6JobsService
   */
  alignJobs() {
    this.jobs = {
      a9c703c7d4477744153584f784512b8b: this.externalApiLogJob,
    };
  }

  /**
   * assign the jobs service to the local property
   * @memberof Es6JobsService
   */
  setJobs() {
    PlatformUtility.setJobs(this.jobs);
  }
}
