import { CacheService, PropertyService, RemoteRawResponseDto } from '@servicelabsco/nestjs-utility-services';
import { FcmTokenEntity, NotificationPayloadDto } from '@servicelabsco/slabs-access-manager';
import { JWT } from 'google-auth-library';
import { LocalSqsService } from './local.sqs.service';
import console = require('console');
const serviceAccount = require('../../../dartinbox-f9514-21057035628e.json');

/**
 *
 * @description This will send the message to the user
 *
 */
export class SendFcmNotification {
  protected payload: NotificationPayloadDto;
  protected token: string;

  constructor(
    private readonly propertyService: PropertyService,
    private readonly localSqsService: LocalSqsService,
    private readonly cacheService: CacheService
  ) {}

  async process(payload: NotificationPayloadDto) {
    this.payload = payload;
    this.token = await this.getToken();

    for (const user of this.payload.user_ids) {
      const token = await this.getUserToken(user);
      if (!token) continue;

      const message = await this.sendMessage(token);
    }
  }

  async sendMessage(token: string) {
    return this.sendNotification(this.payload.data, token);
  }

  async getUserToken(user_id: number) {
    const token = await FcmTokenEntity.findOne({ where: { business_id: this.payload.business.id, user_id, active: true } });
    if (token) return token?.token;
    return;
  }

  async sendNotification(data: any, token: string): Promise<RemoteRawResponseDto> {
    const url = await this.propertyService.get('fcm.url');

    const options: any = {
      method: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      data: {
        message: {
          token,
          ...data,
          apns: {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                alert: {
                  title: data?.notification?.title,
                  body: data?.notification?.body,
                },
                sound: 'default',
              },
            },
          },
        },
      },
      metaData: {
        type: 'push-notification',
      },
    };

    return this.localSqsService.trigger(options);
  }

  async getToken() {
    const cacheKey = `fcm.access.token`;

    const token = await this.getTokenFromCacheService(cacheKey);
    if (token) return token;

    const newToken = await this.getTokenFromTheGoogle();
    if (!newToken) return;

    await this.cacheService.set(cacheKey, newToken?.access_token, new Date(newToken.expiry_date));
    return newToken?.access_token;
  }

  async getTokenFromCacheService(cacheKey: string) {
    return this.cacheService.get(cacheKey);
  }

  async getTokenFromTheGoogle() {
    try {
      // Create a JWT client
      const client = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key.replace(/\\n/g, '\n'), // Ensure proper formatting
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      });

      // Request an access token
      const accessToken = await client.authorize();
      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  }
}
