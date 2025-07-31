import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Role,
  Permission,
  PermissionAction,
  PermissionResource,
} from '../entities';

interface RoleDefinition {
  name: string;
  code: string;
  description: string;
  priority: number;
  permissions: string[];
}

@Injectable()
export class RbacSeederService {
  private readonly logger = new Logger(RbacSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log('Starting RBAC seeding...');

    await this.seedPermissions();
    await this.seedRoles();

    this.logger.log('RBAC seeding completed');
  }

  private async seedPermissions(): Promise<void> {
    this.logger.log('Seeding permissions...');

    const permissions: Array<{
      name: string;
      code: string;
      description: string;
      resource: PermissionResource;
      action: PermissionAction;
    }> = [];

    // Generar permisos para cada recurso y acción
    for (const resource of Object.values(PermissionResource)) {
      for (const action of Object.values(PermissionAction)) {
        // Skip MANAGE for individual resources except SYSTEM
        if (
          action === PermissionAction.MANAGE &&
          resource !== PermissionResource.SYSTEM
        ) {
          continue;
        }

        const code = `${resource.toUpperCase()}_${action.toUpperCase()}`;
        const name = `${resource}:${action}`;
        const description = `${action} permissions for ${resource}`;

        permissions.push({
          name,
          code,
          description,
          resource: resource as PermissionResource,
          action: action as PermissionAction,
        });
      }
    }

    // Add SYSTEM_MANAGE permission
    permissions.push({
      name: 'system:manage',
      code: 'SYSTEM_MANAGE',
      description: 'Full system management permissions',
      resource: PermissionResource.SYSTEM,
      action: PermissionAction.MANAGE,
    });

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: permissionData.code },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permissionData.code}`);
      }
    }
  }

  private async seedRoles(): Promise<void> {
    this.logger.log('Seeding roles...');

    const roleDefinitions: RoleDefinition[] = [
      {
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
        description: 'Full system access and management',
        priority: 100,
        permissions: [
          'SYSTEM_MANAGE',
          'USER_CREATE',
          'USER_READ',
          'USER_UPDATE',
          'USER_DELETE',
          'ROLE_CREATE',
          'ROLE_READ',
          'ROLE_UPDATE',
          'ROLE_DELETE',
          'PERMISSION_CREATE',
          'PERMISSION_READ',
          'PERMISSION_UPDATE',
          'PERMISSION_DELETE',
          'PRODUCT_CREATE',
          'PRODUCT_READ',
          'PRODUCT_UPDATE',
          'PRODUCT_DELETE',
          'ORDER_CREATE',
          'ORDER_READ',
          'ORDER_UPDATE',
          'ORDER_DELETE',
          'CATEGORY_CREATE',
          'CATEGORY_READ',
          'CATEGORY_UPDATE',
          'CATEGORY_DELETE',
          'FILE_CREATE',
          'FILE_READ',
          'FILE_UPDATE',
          'FILE_DELETE',
        ],
      },
      {
        name: 'Admin',
        code: 'ADMIN',
        description: 'Administrative access to most features',
        priority: 80,
        permissions: [
          'USER_CREATE',
          'USER_READ',
          'USER_UPDATE',
          'USER_DELETE',
          'PRODUCT_CREATE',
          'PRODUCT_READ',
          'PRODUCT_UPDATE',
          'PRODUCT_DELETE',
          'ORDER_CREATE',
          'ORDER_READ',
          'ORDER_UPDATE',
          'ORDER_DELETE',
          'CATEGORY_CREATE',
          'CATEGORY_READ',
          'CATEGORY_UPDATE',
          'CATEGORY_DELETE',
          'FILE_CREATE',
          'FILE_READ',
          'FILE_UPDATE',
          'FILE_DELETE',
          'ROLE_READ',
          'PERMISSION_READ',
        ],
      },
      {
        name: 'Manager',
        code: 'MANAGER',
        description: 'Management access to business operations',
        priority: 60,
        permissions: [
          'USER_READ',
          'PRODUCT_CREATE',
          'PRODUCT_READ',
          'PRODUCT_UPDATE',
          'ORDER_READ',
          'ORDER_UPDATE',
          'CATEGORY_READ',
          'CATEGORY_UPDATE',
          'FILE_READ',
        ],
      },
      {
        name: 'Employee',
        code: 'EMPLOYEE',
        description: 'Basic employee access',
        priority: 40,
        permissions: [
          'PRODUCT_READ',
          'ORDER_READ',
          'CATEGORY_READ',
          'FILE_READ',
        ],
      },
      {
        name: 'User',
        code: 'USER',
        description: 'Basic user access',
        priority: 20,
        permissions: ['PRODUCT_READ', 'ORDER_CREATE', 'ORDER_READ'],
      },
      {
        name: 'Guest',
        code: 'GUEST',
        description: 'Limited guest access',
        priority: 10,
        permissions: ['PRODUCT_READ'],
      },
    ];

    for (const roleData of roleDefinitions) {
      let role = await this.roleRepository.findOne({
        where: { code: roleData.code },
        relations: ['permissions'],
      });

      if (!role) {
        role = this.roleRepository.create({
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          priority: roleData.priority,
        });
        this.logger.log(`Created role: ${roleData.code}`);
      }

      // Assign permissions
      const permissions = await this.permissionRepository.find({
        where: roleData.permissions.map((code) => ({ code })),
      });

      role.permissions = permissions;
      await this.roleRepository.save(role);

      this.logger.log(
        `Assigned ${permissions.length} permissions to role: ${roleData.code}`,
      );
    }
  }
}
