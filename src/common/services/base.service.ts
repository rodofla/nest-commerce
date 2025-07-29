import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { isPostgresError } from '../utils/postgres-error.util';

@Injectable()
export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  protected handleDBExceptions(error: unknown): never {
    // Verificar si es un error de PostgreSQL usando la utility function
    if (isPostgresError(error)) {
      const { code, detail } = error.driverError;

      switch (code) {
        case '23505': // Violación de constraint único
          throw new BadRequestException(detail);
        case '23502': // Violación de NOT NULL
          throw new BadRequestException('Required field is missing');
        case '23503': // Violación de foreign key
          throw new BadRequestException('Referenced record does not exist');
        case '23514': // Violación de CHECK constraint
          throw new BadRequestException('Data validation failed');
        default:
          this.logger.error(`PostgreSQL error ${code}: ${detail}`);
          throw new InternalServerErrorException(
            'Database constraint violation',
          );
      }
    }

    // Si es un QueryFailedError pero no tiene la estructura de PostgreSQL
    if (error instanceof QueryFailedError) {
      this.logger.error(`Database query failed: ${error.message}`);
      throw new InternalServerErrorException('Database query failed');
    }

    // Para cualquier otro tipo de error
    this.logger.error(`Unexpected error: ${String(error)}`);
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
