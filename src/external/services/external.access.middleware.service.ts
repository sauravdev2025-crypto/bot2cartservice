import { Injectable, NestMiddleware } from '@nestjs/common';
import { AccessException, Auth, AuthService, ClientCredentialDto } from '@servicelabsco/nestjs-utility-services';
import { ApiAccountService } from '@servicelabsco/slabs-access-manager';
import { Request, Response } from 'express';
import { CommunicationApiAccountEntity } from '../../business/entities/communication.api.account.entity';
import { ExternalApiLogEntity } from '../entities/external.api.log.entity';

/**
 * middleware to tackle external server calls
 * @export
 * @class BusinessMiddleware
 * @implements {NestMiddleware}
 */
@Injectable()
export class ExternalAccessMiddlewareService implements NestMiddleware {
  /**
   * Creates an instance of BusinessMiddleware.
   * @memberof BusinessMiddleware
   */
  constructor(
    protected readonly apiAccountService: ApiAccountService,
    protected readonly authService: AuthService
  ) {}

  /**
   * default function to check for the bearer token
   * @param {*} req
   * @param {Response} res
   * @param {Function} next
   * @returns {Promise<Function>}
   * @memberof BusinessMiddleware
   */
  // tslint:disable-next-line: ban-types
  // eslint-disable-next-line @typescript-eslint/ban-types
  // tslint:disable-next-line: ban-types
  async use(req: any, res: Response, next: Function) {
    const clientId = req.headers['x-client-id'];
    const clientSecret = req.headers['x-client-secret'];

    if (!(clientId && clientSecret)) throw new AccessException('Invalid client headers');

    const ip = req.headers['x-forwarded-for'] || req.ip || req.ips[0];

    const payload: ClientCredentialDto = { client_id: clientId, client_secret: clientSecret, ip };

    const client = await this.apiAccountService.validate(payload);
    if (!client) throw new AccessException(`Invalid credentials`);

    const accessObject = await this.authService.getUserObject(2);

    accessObject.auth_attributes = { client_id: client, business_id: client.business_id };

    // check if user is blocked from the platform
    Auth.login(accessObject);

    // Save initial request log
    const log = await this.saveLog(req, { status: 'pending' });

    // Intercept the response to save the final log
    const originalSend = res.send;

    res.send = (body) => {
      // Update the log with the response
      log.response = JSON.parse(body);
      log.save();

      return originalSend.call(res, body);
    };

    next();
  }

  async saveLog(req: Request, responseBody: any) {
    const user = Auth.user();

    const client_id = user?.auth_attributes?.client_id?.client_id;
    if (!client_id) throw new AccessException();

    const client = await CommunicationApiAccountEntity.findOne({ where: { identifier: client_id, active: true } });
    if (!client) throw new AccessException('Invalid Client');

    const log = ExternalApiLogEntity.create({ api_account_id: client.id, business_id: client.business_id });

    log.is_incoming = true;

    log.request = {
      body: req.body,
      query: req.query,
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      user_agent: req.get('User-Agent'),
      device: req.get('Device'),
      referrer: req.get('Referrer'),
      host: req.get('Host'),
      protocol: req.protocol,
    };

    log.response = responseBody;
    return log.save();
  }
}
