import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from '@servicelabsco/nestjs-utility-services';
import sentryConfig from './config/sentry.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    global.console.log('sentryDsn', sentryDsn);
    Sentry.init(sentryConfig);
    app.useGlobalInterceptors(new SentryInterceptor());
  }

  // handle sentry logging as per new way
  app.init();
}

bootstrap();
