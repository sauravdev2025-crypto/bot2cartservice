import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Observable, Subject, filter, map } from 'rxjs';

export interface InboxMessage {
  inboxId: number;
  data: any;
}

@Injectable()
export class MessageGateway implements OnModuleInit, OnModuleDestroy {
  // Single Subject for all inbox messages
  private inboxEvents$ = new Subject<InboxMessage>();

  // Redis clients for pub/sub
  private pub: Redis;
  private sub: Redis;

  // Redis channel name
  private readonly redisChannel = 'inbox_messages';
  private readonly logger = new Logger(MessageGateway.name);

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;
    const password = process.env.REDIS_PASSWORD || '';
    const username = process.env.REDIS_USERNAME || '';

    const redisUrl = `redis://${password ? `${username}:${password}@` : ''}${host}:${port}`;
    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);
    this.logger.log(`Initialized Redis clients with URL: ${redisUrl}`);
  }

  onModuleInit() {
    // Subscribe to Redis channel
    this.sub.subscribe(this.redisChannel, (err, count) => {
      if (err) {
        this.logger.error(`Failed to subscribe to Redis channel ${this.redisChannel}:`, err);
      } else {
        this.logger.log(`Subscribed to Redis channel: ${this.redisChannel} (count: ${count})`);
      }
    });
    this.sub.on('message', (_channel, message) => {
      try {
        const payload: InboxMessage = JSON.parse(message);
        this.logger.log(`Received message on channel ${_channel}: ${JSON.stringify(payload)}`);
        this.inboxEvents$.next(payload); // Push to local SSE subscribers
      } catch (err) {
        this.logger.error('Invalid inbox message from Redis', err);
      }
    });
  }

  onModuleDestroy() {
    this.logger.log('Shutting down Redis clients and completing inboxEvents$ subject.');
    this.pub.quit();
    this.sub.quit();
    this.inboxEvents$.complete();
  }

  // Subscribe to a specific inbox
  subscribeToInbox(inboxId: number): Observable<{ data: any }> {
    this.logger.log(`New subscription to inboxId: ${inboxId}`);
    return this.inboxEvents$.pipe(
      filter((msg) => msg.inboxId === inboxId),
      map((msg) => ({ data: msg.data }))
    );
  }

  // Push a message to an inbox (all workers will get it via Redis)
  pushToInbox(inboxId: number, payload: any) {
    const message: InboxMessage = { inboxId, data: payload };
    this.pub.publish(this.redisChannel, JSON.stringify(message));
  }
}
