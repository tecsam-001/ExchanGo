import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';

export interface ErrorFieldMapping {
  [constraintName: string]: string;
}

export interface ErrorHandlerConfig {
  operation: string; // e.g., 'office creation', 'rate creation'
  uniqueConstraints?: ErrorFieldMapping;
  foreignKeyConstraints?: ErrorFieldMapping;
  checkConstraints?: ErrorFieldMapping;
}

export class ErrorHandler {
  static handle(error: any, config: ErrorHandlerConfig): never {
    // Re-throw NestJS exceptions as-is
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof InternalServerErrorException ||
      error instanceof UnprocessableEntityException
    ) {
      throw error;
    }

    // Handle database constraint violations
    if (error?.code === '23505') {
      return this.handleUniqueConstraintViolation(error, config);
    }

    if (error?.code === '23503') {
      return this.handleForeignKeyViolation(error, config);
    }

    if (error?.code === '23514') {
      return this.handleCheckConstraintViolation(error, config);
    }

    if (error?.code === '23502') {
      return this.handleNotNullViolation(error);
    }

    // Handle validation errors
    if (
      error?.name === 'ValidationError' ||
      error?.constructor?.name === 'ValidationError'
    ) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          validation: 'invalidDataProvided',
        },
      });
    }

    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT') {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          timeout: 'requestTimeout',
        },
      });
    }

    // Handle network/connection errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          connection: 'serviceUnavailable',
        },
      });
    }

    // Handle file system errors
    if (error?.code === 'ENOENT') {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          file: 'fileNotFound',
        },
      });
    }

    if (error?.code === 'EACCES') {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          file: 'fileAccessDenied',
        },
      });
    }

    // Handle memory/resource errors
    if (error?.code === 'ENOMEM') {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          resource: 'insufficientMemory',
        },
      });
    }

    // Handle numeric errors
    if (error?.code === '22003') {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          value: 'valueOutOfRange',
        },
      });
    }

    if (error?.code === '22P02') {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          data: 'invalidDataFormat',
        },
      });
    }

    // Handle any other unexpected errors
    console.error(`Unexpected error during ${config.operation}:`, error);
    throw new InternalServerErrorException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errors: {
        operation: 'operationFailed',
      },
    });
  }

  private static handleUniqueConstraintViolation(
    error: any,
    config: ErrorHandlerConfig,
  ): never {
    const constraintName = error?.constraint || 'unknown';
    const field = config.uniqueConstraints?.[constraintName] || 'resource';

    throw new ConflictException({
      status: HttpStatus.CONFLICT,
      errors: {
        [field]: 'alreadyExists',
      },
    });
  }

  private static handleForeignKeyViolation(
    error: any,
    config: ErrorHandlerConfig,
  ): never {
    const constraintName = error?.constraint || 'unknown';
    const field = config.foreignKeyConstraints?.[constraintName] || 'reference';

    throw new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      errors: {
        [field]: 'invalidReference',
      },
    });
  }

  private static handleCheckConstraintViolation(
    error: any,
    config: ErrorHandlerConfig,
  ): never {
    const constraintName = error?.constraint || 'unknown';
    const field = config.checkConstraints?.[constraintName];

    if (field) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          [field]: 'violatesConstraint',
        },
      });
    }

    throw new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      errors: {
        data: 'violatesBusinessRules',
      },
    });
  }

  private static handleNotNullViolation(error: any): never {
    const column = error?.column || 'unknown';
    throw new BadRequestException({
      status: HttpStatus.BAD_REQUEST,
      errors: {
        [column]: 'fieldRequired',
      },
    });
  }
}

// Validation helper functions
export class ValidationHelper {
  static validateRequired(value: any, fieldName: string): void {
    if (!value) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          [fieldName]: 'fieldRequired',
        },
      });
    }
  }

  static validateCurrencyCode(
    code: string,
    fieldName: string = 'currency',
  ): string {
    if (!code) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          [fieldName]: 'currencyRequired',
        },
      });
    }

    const upperCode = code.toUpperCase();
    if (upperCode.length !== 3) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          [fieldName]: 'invalidCurrencyFormat',
        },
      });
    }

    return upperCode;
  }

  static validatePositiveNumber(value: number, fieldName: string): void {
    if (value !== undefined && value <= 0) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          [fieldName]: 'mustBePositive',
        },
      });
    }
  }

  static validateLocationCoordinates(location: any): void {
    if (!location) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          location: 'locationRequired',
        },
      });
    }

    if (
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          location: 'invalidLocationFormat',
        },
      });
    }
  }

  static validateRateRelationship(buyRate?: number, sellRate?: number): void {
    if (
      buyRate !== undefined &&
      sellRate !== undefined &&
      buyRate >= sellRate
    ) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        errors: {
          rates: 'buyRateMustBeLowerThanSellRate',
        },
      });
    }
  }

  static throwNotFound(resource: string, field: string = 'id'): never {
    throw new NotFoundException({
      status: HttpStatus.NOT_FOUND,
      errors: {
        [field]: `${resource}NotFound`,
      },
    });
  }

  static throwConflict(resource: string, field: string): never {
    throw new ConflictException({
      status: HttpStatus.CONFLICT,
      errors: {
        [field]: `${resource}AlreadyExists`,
      },
    });
  }
}
