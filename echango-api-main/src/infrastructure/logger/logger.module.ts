import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { LoggerService } from './logger.service';
// Import the Loki transport
// import LokiTransport from 'winston-loki';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(
              ({
                timestamp,
                level,
                message,
                context,
                trace,
                stack,
                ...meta
              }) => {
                const metaStr = Object.keys(meta).length
                  ? JSON.stringify(meta, null, 2)
                  : '';
                const stackStr = stack || (trace ? `\n${trace}` : '');
                return `[${timestamp}] [${level}] ${context ? `[${context}]` : ''} ${message} ${metaStr} ${stackStr}`;
              },
            ),
          ),
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        }),
        // File transport for errors
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json(),
          ),
          zippedArchive: true,
          handleExceptions: true,
        }),
        // File transport for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.json(),
          ),
          zippedArchive: true,
        }),
        // Loki transport for Grafana
        // new LokiTransport({
        //   host: process.env.LOKI_HOST || 'http://localhost:3100',
        //   labels: { app: 'sod-api' },
        //   json: true,
        //   format: winston.format.combine(
        //     winston.format.errors({ stack: true }),
        //     winston.format.timestamp(),
        //     winston.format.json()
        //   ),
        //   replaceTimestamp: true,
        //   onConnectionError: (err) => console.error(err)
        // }),
      ],
      // Custom log levels
      levels: winston.config.npm.levels,
      exitOnError: false,
    }),
  ],
  providers: [LoggerService],
  exports: [WinstonModule, LoggerService],
})
export class LoggerModule {}
