import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { RedisIoAdapter, SentryInterceptor } from '@servicelabsco/nestjs-utility-services';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import 'dotenv/config';
import * as hbs from 'express-handlebars';
import * as httpContext from 'express-http-context';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { join } from 'path';
import 'source-map-support/register';
import { AppModule } from './app.module';
import * as corsConfig from './config/cors.config';
import rateLimiterConfig from './config/rate.limiter.config';
import sentryConfig from './config/sentry.config';
import { ExternalModule } from './external/external.module';

// set stack trace limit to higher number
Error.stackTraceLimit = 100;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(httpContext.middleware);

  app.enableCors(corsConfig);
  app.use(rateLimit(rateLimiterConfig));
  app.use(compression());

  app.set('trust proxy', 1);

  if (process.env.SERVER_COOL_DOWN_PERIOD) app.enableShutdownHooks();

  // handle sentry logging as per new way
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    global.console.log('sentryDsn', sentryDsn);
    Sentry.init(sentryConfig);
    app.useGlobalInterceptors(new SentryInterceptor());
  }

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useStaticAssets(join(__dirname, '..', 'views'));

  app.engine('hbs', hbs({ extname: 'hbs' }));
  app.setViewEngine('hbs');

  const options = new DocumentBuilder()
    .setTitle('✨ External Communication API Documentation ✨')
    .setDescription(
      'Comprehensive API documentation for managing external communication templates and messages. This API enables seamless integration with various communication channels, including WhatsApp template messaging and normal messaging capabilities. Explore the endpoints to send, manage, and track your external communications efficiently.'
    )
    .setVersion('1.0')
    .addTag('v1')
    .addGlobalParameters({ name: 'x-client-id', in: 'header', description: 'Client ID for authentication', required: true })
    .addGlobalParameters({
      name: 'x-client-secret',
      in: 'header',
      description: 'Client Secret for authentication',
      required: true,
    })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, options, { include: [ExternalModule] });
  SwaggerModule.setup('dart-collections', app, documentFactory, {
    swaggerOptions: {
      cache: false,
      persistAuthorization: false,
    },
  });

  // starting the server on the defined port
  await app.listen(process.env.SERVER_PORT || 4000);
}
bootstrap();
