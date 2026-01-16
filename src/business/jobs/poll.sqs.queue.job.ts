import { Injectable } from '@nestjs/common';
import { CommonJob, QueueService, SqsService } from '@servicelabsco/nestjs-utility-services';
import { HandleFacebookWebhookJob } from './handle.facebook.webhook.job';
import { ProcessBroadcastMessageResponseJob } from './process.broadcast.message.response.job';
import { ProcessWebhookRelayResponseJob } from './process.webhook.relay.response.job';

/**
 * Polls two SQS queues concurrently for webhook messages and processes them.
 *
 * Handles:
 * - Incoming WhatsApp webhook messages from messageQueue
 * - Webhook relay responses from relayQueue
 *
 * Runs until timeout (99% of 1 hour) or job termination conditions.
 */
@Injectable()
export class PollSqsQueueJob extends CommonJob {
  // ============================================================================
  // CLASS PROPERTIES
  // ============================================================================

  /** Prevents concurrent job execution */
  protected readonly noDuplicate: boolean = true;

  /** Job timeout: 1 hour in milliseconds */
  protected readonly timeout: number = 3600000;

  /** Runtime limit: 99% of timeout */
  protected readonly maxRunsMs: number = 0.99;

  /** Incoming WhatsApp webhook queue URL */
  protected readonly messageQueue: string = 'https://sqs.ap-south-1.amazonaws.com/294337990581/incoming-whatsapp-webhook';

  /** Webhook relay response queue URL */
  protected readonly relayQueue: string = 'https://sqs.ap-south-1.amazonaws.com/294337990581/dart-webhook-sqs-response';

  /** Processed incoming message count */
  protected messageCount: number = 0;

  /** Processed relay message count */
  protected relayCount: number = 0;

  /** Job start timestamp */
  private startedAt = Date.now();

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  /**
   * @param queueService - Job queue management
   * @param sqsService - AWS SQS operations
   * @param handleFacebookWebhookJob - Facebook webhook processor
   * @param processWebhookRelayResponseJob - Webhook relay processor
   * @param processBroadcastMessageResponseJob - Broadcast message processor
   */
  constructor(
    protected readonly queueService: QueueService,
    private readonly sqsService: SqsService,
    protected readonly handleFacebookWebhookJob: HandleFacebookWebhookJob,
    protected readonly processWebhookRelayResponseJob: ProcessWebhookRelayResponseJob,
    protected readonly processBroadcastMessageResponseJob: ProcessBroadcastMessageResponseJob
  ) {
    super('49e3e38d8e42f48f2868b067d290cc4a');
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Executes both queue handlers concurrently.
   */
  async handle(): Promise<void> {
    const promises: Promise<void>[] = [];

    promises.push(this.handleIncomingMessage());
    promises.push(this.handleRelayMessage());

    await Promise.all(promises);
  }

  // ============================================================================
  // INCOMING MESSAGE HANDLING
  // ============================================================================

  /**
   * Polls incoming WhatsApp webhook queue until timeout.
   */
  async handleIncomingMessage(): Promise<void> {
    const maxRun = this.timeout * this.maxRunsMs;
    const fetchCount = this.getFetchCount(this.messageQueue);

    while (true) {
      const elapsed = Date.now() - this.startedAt;
      if (elapsed >= maxRun) return;

      const response = await this.sqsService.get(this.messageQueue, fetchCount, { WaitTimeSeconds: 20 });
      await this.processIncomingMessages(response?.Messages || []);
    }
  }

  /**
   * Processes batch of incoming messages.
   * @param messages - SQS messages to process
   */
  private async processIncomingMessages(messages: any[]): Promise<void> {
    for (const message of messages) {
      await this.processIncomingMessage(message);
    }
    this.logMessage();
  }

  /**
   * Processes single incoming message: parse, dispatch, delete.
   * @param message - SQS message to process
   */
  private async processIncomingMessage(message: any): Promise<void> {
    const payload = JSON.parse(message.Body);
    this.messageCount++;

    await this.processIncomingData(payload);
    await this.sqsService.delete(this.messageQueue, message.ReceiptHandle);
  }

  /**
   * Dispatches incoming webhook data to Facebook handler.
   * @param res - Parsed message data
   */
  private async processIncomingData(res: any): Promise<void> {
    if (!res?.payload?.parsedBody) return;
    return this.handleFacebookWebhookJob.dispatch(res?.payload?.parsedBody);
  }

  // ============================================================================
  // RELAY MESSAGE HANDLING
  // ============================================================================

  /**
   * Polls webhook relay response queue until timeout.
   */
  async handleRelayMessage(): Promise<void> {
    const maxRun = this.timeout * this.maxRunsMs;
    const fetchCount = this.getFetchCount(this.relayQueue);

    while (true) {
      const elapsed = Date.now() - this.startedAt;
      if (elapsed >= maxRun) return;

      const response = await this.sqsService.get(this.relayQueue, fetchCount, { WaitTimeSeconds: 20 });
      await this.processRelayMessages(response?.Messages || []);
    }
  }
  /**
   * Processes batch of relay messages.
   * @param messages - SQS messages to process
   */
  private async processRelayMessages(messages: any[]): Promise<void> {
    for (const message of messages) {
      await this.processRelayMessage(message);
    }
    this.logMessage();
  }

  /**
   * Processes single relay message: parse, dispatch, delete.
   * @param message - SQS message to process
   */
  private async processRelayMessage(message: any): Promise<void> {
    const payload = JSON.parse(message.Body);
    this.relayCount++;

    await this.processRelayData(payload);
    await this.sqsService.delete(this.relayQueue, message.ReceiptHandle);
  }

  /**
   * Routes relay message to appropriate handler by type.
   * @param payload - Parsed message data
   */
  private async processRelayData(payload: any): Promise<void> {
    const { type } = payload?.metadata || {};

    if (type === 'broadcast') {
      return this.processBroadcastMessageResponseJob.dispatch(payload);
    }

    if (type === 'webhook') {
      return this.processWebhookRelayResponseJob.dispatch(payload);
    }

    // Default fallback - TODO: remove this default case
    return this.processWebhookRelayResponseJob.dispatch(payload);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Returns fetch count based on queue type.
   * @param url - Queue URL to check
   * @returns Fetch count (1 for FIFO, 10 for standard)
   */
  private getFetchCount(url: string): number {
    return this.isFifo(url) ? 1 : 10;
  }

  /**
   * Checks if queue is FIFO type.
   * @param url - Queue URL to check
   * @returns true if FIFO queue
   */
  private isFifo(url: string): boolean {
    return url.split('.').pop()?.toLowerCase() === 'fifo';
  }

  /**
   * Logs processing statistics.
   */
  private logMessage(): void {
    const elapsedSeconds = (Date.now() - this.startedAt) / 1000;
    this.logger.log(
      `[PollSqsQueueJob] Elapsed ${Math.round(elapsedSeconds)} s : Messages Processed ${this.messageCount} : Relay Processed ${this.relayCount}`
    );
  }
}
