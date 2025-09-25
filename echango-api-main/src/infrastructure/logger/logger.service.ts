import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'verbose';
type LogMessage = string | Error | Record<string, any>;

@Injectable() // Default singleton scope
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  setContext(context: string): void {
    this.context = context;
  }

  private handleLog(
    level: LogLevel,
    message: LogMessage,
    context?: string,
    trace?: string,
  ): void {
    context = context || this.context;

    if (message instanceof Error) {
      this.logger[level](message.message, {
        context,
        trace: trace || message.stack,
        ...this.extractMetadata(message),
      });
    } else if (typeof message === 'object') {
      const { message: msg, ...meta } = message as Record<string, any>;
      this.logger[level](msg as string, { context, trace, ...meta });
    } else {
      this.logger[level](message, { context, trace });
    }
  }

  log(message: LogMessage, context?: string): void {
    this.handleLog('info', message, context);
  }

  error(message: LogMessage, trace?: string, context?: string): void {
    this.handleLog('error', message, context, trace);
  }

  warn(message: LogMessage, context?: string): void {
    this.handleLog('warn', message, context);
  }

  debug(message: LogMessage, context?: string): void {
    this.handleLog('debug', message, context);
  }

  verbose(message: LogMessage, context?: string): void {
    this.handleLog('verbose', message, context);
  }

  private extractMetadata(error: Error): Record<string, any> {
    try {
      const metadata: Record<string, any> = {};
      const excludedProps = new Set(['message', 'name', 'stack']);

      Object.getOwnPropertyNames(error).forEach((key) => {
        if (!excludedProps.has(key)) {
          metadata[key] = (error as any)[key];
        }
      });

      return metadata;
    } catch (err) {
      console.log(err);
      return { extractionError: 'Failed to extract error metadata' };
    }
  }
}
