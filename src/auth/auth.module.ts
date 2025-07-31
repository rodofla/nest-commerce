import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, Role, Permission } from './entities';
import { BcryptAdapter } from './adapters/bcrypt-adapter';
import { JwtStrategy } from './strategies/jwt.strategy';

// Services
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { UserRoleService } from './services/user-role.service';
import { RbacSeederService } from './services/rbac-seeder.service';

// Controllers
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { RbacSeederController } from './controllers/rbac-seeder.controller';

// Guards
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  controllers: [
    AuthController,
    RoleController,
    PermissionController,
    UserRoleController,
    RbacSeederController,
  ],
  providers: [
    AuthService,
    RoleService,
    PermissionService,
    UserRoleService,
    RbacSeederService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    {
      provide: 'HASHING_ADAPTER',
      useClass: BcryptAdapter,
    },
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
        };
      },
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    AuthService,
    RoleService,
    PermissionService,
    UserRoleService,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
