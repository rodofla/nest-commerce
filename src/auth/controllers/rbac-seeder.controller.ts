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
import { RbacSeederService } from '../services/rbac-seeder.service';
import { Protected } from '../decorators';
import { Role, User } from '../entities';
import { AuthService } from '../auth.service';

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
  @HttpCode(HttpStatus.OK)
  async bootstrap() {
    // Solo permitir si no hay datos (primera vez)
    const roleCount = await this.roleRepository.count();
    const userCount = await this.userRepository.count();

    if (roleCount > 0 || userCount > 1) {
      throw new BadRequestException(
        'Bootstrap only allowed on empty database. Use protected endpoints instead.',
      );
    }

    // 1. Ejecutar seeder
    await this.rbacSeederService.seedAll();

    // 2. Crear usuario admin automáticamente si no existe
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

    // 3. Asignar rol SUPER_ADMIN si no lo tiene
    const superAdminRole = await this.roleRepository.findOne({
      where: { code: 'SUPER_ADMIN' },
    });

    if (superAdminRole) {
      // Verificar si ya tiene el rol
      const userWithRoles = await this.userRepository.findOne({
        where: { id: adminUserId },
        relations: ['roles'],
      });

      const hasRole = userWithRoles?.roles?.some(
        (role) => role.code === 'SUPER_ADMIN',
      );

      if (!hasRole) {
        // Asignar rol manualmente
        await this.userRepository.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
          [adminUserId, superAdminRole.id],
        );
      }
    }

    // 4. Generar token actualizado
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
  @Protected('SYSTEM_MANAGE')
  @HttpCode(HttpStatus.OK)
  async seedAll() {
    // Solo permitir en desarrollo
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
