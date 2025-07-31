import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, Permission } from '../entities';
import { CreateRoleDto, UpdateRoleDto } from '../dto';
import { BaseService } from 'src/common/services/base.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class RoleService extends BaseService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super('RoleService');
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const { permissionIds, ...roleData } = createRoleDto;

      // Verificar que el código no exista
      const existingRole = await this.roleRepository.findOne({
        where: { code: createRoleDto.code },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role with code '${createRoleDto.code}' already exists`,
        );
      }

      const role = this.roleRepository.create(roleData);

      if (permissionIds && permissionIds.length > 0) {
        const permissions = await this.permissionRepository.find({
          where: { id: In(permissionIds) },
        });

        if (permissions.length !== permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }

        role.permissions = permissions;
      }

      return await this.roleRepository.save(role);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: Role[]; total: number }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [data, total] = await this.roleRepository.findAndCount({
      relations: ['permissions'],
      order: { priority: 'DESC', createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async findByCode(code: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { code },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with code '${code}' not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const { permissionIds, ...roleData } = updateRoleDto;
      const role = await this.findOne(id);

      // Si se proporciona un nuevo código, verificar que no exista
      if (updateRoleDto.code && updateRoleDto.code !== role.code) {
        const existingRole = await this.roleRepository.findOne({
          where: { code: updateRoleDto.code },
        });

        if (existingRole) {
          throw new ConflictException(
            `Role with code '${updateRoleDto.code}' already exists`,
          );
        }
      }

      Object.assign(role, roleData);

      if (permissionIds !== undefined) {
        if (permissionIds.length > 0) {
          const permissions = await this.permissionRepository.find({
            where: { id: In(permissionIds) },
          });

          if (permissions.length !== permissionIds.length) {
            throw new NotFoundException('One or more permissions not found');
          }

          role.permissions = permissions;
        } else {
          role.permissions = [];
        }
      }

      return await this.roleRepository.save(role);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Agregar permisos que no tenga ya
    const currentPermissionIds = role.permissions.map((p) => p.id);
    const newPermissions = permissions.filter(
      (p) => !currentPermissionIds.includes(p.id),
    );

    role.permissions = [...role.permissions, ...newPermissions];

    return await this.roleRepository.save(role);
  }

  async removePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    role.permissions = role.permissions.filter(
      (permission) => !permissionIds.includes(permission.id),
    );

    return await this.roleRepository.save(role);
  }

  async getActiveRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { isActive: true },
      relations: ['permissions'],
      order: { priority: 'DESC', name: 'ASC' },
    });
  }
}
