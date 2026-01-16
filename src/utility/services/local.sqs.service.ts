import { Injectable } from '@nestjs/common';
import { PropertyService, SqsService } from '@servicelabsco/nestjs-utility-services';

@Injectable()
export class LocalSqsService {
  protected webhookRelayUrl: string;

  constructor(
    private readonly propertyService: PropertyService,
    private readonly sqsService: SqsService
  ) {}

  // Convenience method to trigger locally without a URL
  async trigger(payload: any) {
    const url = await this.getSqsUrl();

    const options = {
      identifier: payload?.identifier,
      url: payload?.url,
      method: payload?.method || 'POST',
      // Add params so you can see per-request values on the receiver side
      headers: { 'content-type': 'application/json', ...payload?.headers },
      data: payload?.data,
      responseQueueUrl: 'https://sqs.ap-south-1.amazonaws.com/294337990581/dart-webhook-sqs-response',
      metadata: payload?.metaData,
    };

    return this.sqsService.add(url, options);
  }

  public async getSqsUrl() {
    if (this.webhookRelayUrl) return this.webhookRelayUrl;

    const url = await this.propertyService.get('webhook.sqs.url');
    this.webhookRelayUrl = url;

    return url;
  }
}
