import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Injectable()
export class DatabaseLoggerService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('Database');
  }

  logQuery(query: string, parameters?: any[]): void {
    this.logger.verbose({
      message: 'Database query',
      query,
      parameters,
    });
  }

  logQueryError(error: Error, query: string, parameters?: any[]): void {
    this.logger.error({
      message: 'Database query error',
      query,
      parameters,
      error: error.message,
      stack: error.stack,
    });
  }
}
