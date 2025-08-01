import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { RbacSeederService } from '../services/rbac-seeder.service';
import { Protected } from '../decorators';
import { Role, User } from '../entities';
import { AuthService } from '../auth.service';

@ApiTags('RBAC Seeder')
@Controller('rbac-seeder')
export class RbacSeederController {
  constructor(
    private readonly rbacSeederService: RbacSeederService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('bootstrap')
  @ApiOperation({
    summary: 'Bootstrap RBAC system',
    description:
      'Initialize the RBAC system with default roles, permissions, and admin user. Only works on empty database.',
  })
  @ApiOkResponse({
    description: 'RBAC system bootstrapped successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'RBAC system bootstrapped successfully!',
        },
        adminCredentials: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              example: 'admin@localhost.com',
            },
            password: {
              type: 'string',
              example: 'Admin123!',
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bootstrap only allowed on empty database',
  })
  @HttpCode(HttpStatus.OK)
  async bootstrap() {
    // Only allow if there's no data (first time)
    const roleCount = await this.roleRepository.count();
    const userCount = await this.userRepository.count();

    if (roleCount > 0 || userCount > 1) {
      throw new BadRequestException(
        'Bootstrap only allowed on empty database. Use protected endpoints instead.',
      );
    }

    // 1. Execute seeder
    await this.rbacSeederService.seedAll();

    // 2. Create admin user automatically if it doesn't exist
    let adminUserId: string;
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@localhost.com' },
    });

    if (!existingAdmin) {
      const adminUser = await this.authService.create({
        email: 'admin@localhost.com',
        password: 'Admin123!',
        fullName: 'System Administrator',
      });
      adminUserId = adminUser.id;
    } else {
      adminUserId = existingAdmin.id;
    }

    // 3. Assign SUPER_ADMIN role if not already assigned
    const superAdminRole = await this.roleRepository.findOne({
      where: { code: 'SUPER_ADMIN' },
    });

    if (superAdminRole) {
      // Check if user already has the role
      const userWithRoles = await this.userRepository.findOne({
        where: { id: adminUserId },
        relations: ['roles'],
      });

      const hasRole = userWithRoles?.roles?.some(
        (role) => role.code === 'SUPER_ADMIN',
      );

      if (!hasRole) {
        // Assign role manually
        await this.userRepository.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [adminUserId, superAdminRole.id],
        );
      }
    }

    // 4. Generate updated token
    const loginResponse = await this.authService.login({
      email: 'admin@localhost.com',
      password: 'Admin123!',
    });

    return {
      message: 'RBAC system bootstrapped successfully!',
      adminCredentials: {
        email: 'admin@localhost.com',
        password: 'Admin123!',
        token: loginResponse.token,
      },
    };
  }

  @Post('seed-all')
  @ApiOperation({
    summary: 'Seed all RBAC data',
    description:
      'Manually seed all roles and permissions (requires SYSTEM_MANAGE permission). Disabled in production.',
  })
  @ApiOkResponse({
    description: 'RBAC seeding completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'RBAC seeding completed successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Seeder endpoints are disabled in production for security reasons',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - system management required',
  })
  @ApiBearerAuth('access-token')
  @Protected('SYSTEM_MANAGE')
  @HttpCode(HttpStatus.OK)
  async seedAll() {
    // Only allow in development
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      throw new BadRequestException(
        'Seeder endpoints are disabled in production for security reasons',
      );
    }

    await this.rbacSeederService.seedAll();
    return { message: 'RBAC seeding completed successfully' };
  }
}
