import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionAction, PermissionResource } from '../entities';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { BaseService } from 'src/common/services/base.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PermissionService extends BaseService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super('PermissionService');
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    try {
      // Verificar que el código no exista
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: createPermissionDto.code },
      });

      if (existingPermission) {
        throw new ConflictException(
          `Permission with code '${createPermissionDto.code}' already exists`,
        );
      }

      const permission = this.permissionRepository.create(createPermissionDto);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: Permission[]; total: number }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [data, total] = await this.permissionRepository.findAndCount({
      order: { resource: 'ASC', action: 'ASC', createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }

    return permission;
  }

  async findByCode(code: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code '${code}' not found`);
    }

    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    try {
      const permission = await this.findOne(id);

      // Si se proporciona un nuevo código, verificar que no exista
      if (
        updatePermissionDto.code &&
        updatePermissionDto.code !== permission.code
      ) {
        const existingPermission = await this.permissionRepository.findOne({
          where: { code: updatePermissionDto.code },
        });

        if (existingPermission) {
          throw new ConflictException(
            `Permission with code '${updatePermissionDto.code}' already exists`,
          );
        }
      }

      Object.assign(permission, updatePermissionDto);
      return await this.permissionRepository.save(permission);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async getByResource(resource: PermissionResource): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource, isActive: true },
      order: { action: 'ASC' },
    });
  }

  async getByAction(action: PermissionAction): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { action, isActive: true },
      order: { resource: 'ASC' },
    });
  }

  async getActivePermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { isActive: true },
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async createBulkPermissions(): Promise<Permission[]> {
    const permissions: Partial<Permission>[] = [];

    // Generar permisos para cada recurso y acción
    for (const resource of Object.values(PermissionResource)) {
      for (const action of Object.values(PermissionAction)) {
        // Skip MANAGE for individual resources if you prefer granular permissions
        if (
          action === PermissionAction.MANAGE &&
          resource !== PermissionResource.SYSTEM
        ) {
          continue;
        }

        const code = `${resource.toUpperCase()}_${action.toUpperCase()}`;
        const name = `${resource}:${action}`;
        const description = `${action} permissions for ${resource}`;

        // Check if permission already exists
        const existingPermission = await this.permissionRepository.findOne({
          where: { code },
        });

        if (!existingPermission) {
          permissions.push({
            name,
            code,
            description,
            resource: resource as PermissionResource,
            action: action as PermissionAction,
            isActive: true,
          });
        }
      }
    }

    if (permissions.length > 0) {
      const createdPermissions = this.permissionRepository.create(permissions);
      return await this.permissionRepository.save(createdPermissions);
    }

    return [];
  }
}
