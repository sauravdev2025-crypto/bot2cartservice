import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqsService } from '@servicelabsco/nestjs-utility-services';
import { HandleFacebookWebhookJob } from './handle.facebook.webhook.job';

/**
 * A job class that polls an AWS SQS queue for webhook messages and processes them.
 * This class extends CommonJob to provide job functionality with specific configurations
 * for handling webhook messages from an SQS queue.
 *
 * The job runs continuously until one of the following conditions is met:
 * - Maintenance mode is enabled
 * - Runtime lock is active
 * - Timeout is reached (90% of configured timeout)
 * - Continue flag is set to false
 */
@Injectable()
export class PollWhatsappIncomingMessageJob extends CommonJob {
  /** Flag to prevent duplicate job execution */
  protected noDuplicate: boolean = true;

  /** Maximum execution time in milliseconds (10 minutes) */
  protected timeout: number = 3600000;

  protected maxRunsMs: number = 0.99;

  /** The SQS queue URL being polled */
  protected sqsQueue: string = 'https://sqs.ap-south-1.amazonaws.com/294337990581/dart-incoming-whatsapp-webhook';

  protected countOfMessages: number = 0;

  constructor(
    protected readonly queueService: QueueService,
    private readonly sqsService: SqsService,
    protected readonly handleFacebookWebhookJob: HandleFacebookWebhookJob
  ) {
    super('42ae8f5be570b6fb31a3d32cd5e59b76');
  }

  /**
   * Main handler method that polls the SQS queue and processes messages.
   * @param url - The SQS queue URL to poll
   */
  async handle() {
    const url = this.sqsQueue;
    this.countOfMessages = 0;

    const startedAt = Date.now();
    const maxRunSecond = Math.floor(this.timeout * this.maxRunsMs) / 1000;

    const isFifo = this.isFifo(url);
    const fetchCount = isFifo ? 1 : 10;

    while (true) {
      const elapsedS = (Date.now() - startedAt) / 1000; // sec
      if (elapsedS >= maxRunSecond) {
        this.logger.log(`[PollWhatsappIncomingMessageJob] Exiting after ${elapsedS} s (>= 90% of ${this.timeout} ms)`);

        return;
      }
      this.logger.log(`[PollWhatsappIncomingMessageJob] Elapsed ${elapsedS} s : Messages processed ${this.countOfMessages}`);

      const response = await this.sqsService.get(url, fetchCount, { WaitTimeSeconds: 20 });
      const messages = response?.Messages || [];

      await this.processMessages(messages || []);
    }
  }

  /**
   * Processes multiple messages from the SQS queue.
   * @param messages - Array of SQS messages to process
   */
  private async processMessages(messages: any[]) {
    for (const message of messages) {
      await this.processMessage(message);
    }
  }

  /**
   * Processes a single SQS message.
   * Parses the message body, dispatches it to the webhook handler,
   * and deletes the message from the queue after processing.
   * @param message - The SQS message to process
   */
  private async processMessage(message: any) {
    const payload = JSON.parse(message.Body);
    this.countOfMessages++;

    await this.processData(payload);
    await this.sqsService.delete(this.sqsQueue, message.ReceiptHandle);
  }

  private async processData(res: any) {
    if (!res?.payload?.parsedBody) return;

    return this.handleFacebookWebhookJob.dispatch(res?.payload?.parsedBody);
  }

  /**
   * Determines if the given SQS queue URL is a FIFO queue.
   * @param url - The SQS queue URL to check
   * @returns true if the queue is a FIFO queue, false otherwise
   */
  private isFifo(url: string): boolean {
    return url.split('.').pop()?.toLowerCase() === 'fifo';
  }
}
