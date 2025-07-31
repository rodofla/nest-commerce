import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, Role, Permission } from '../entities';
import { BaseService } from 'src/common/services/base.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class UserRoleService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super('UserRoleService');
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), isActive: true },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found or inactive');
    }

    // Agregar roles que no tenga ya
    const currentRoleIds = user.roles.map((role) => role.id);
    const newRoles = roles.filter((role) => !currentRoleIds.includes(role.id));

    user.roles = [...user.roles, ...newRoles];

    return await this.userRepository.save(user);
  }

  async removeRolesFromUser(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    user.roles = user.roles.filter((role) => !roleIds.includes(role.id));

    return await this.userRepository.save(user);
  }

  async replaceUserRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const roles = await this.roleRepository.find({
      where: { id: In(roleIds), isActive: true },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found or inactive');
    }

    user.roles = roles;

    return await this.userRepository.save(user);
  }

  async getUsersWithRole(
    roleId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: User[];
    total: number;
  }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    const [data, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.id = :roleId', { roleId })
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { data, total };
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const permissions = new Set<string>();

    user.roles
      .filter((role) => role.isActive)
      .forEach((role) => {
        if (role.permissions) {
          role.permissions
            .filter((permission: Permission) => permission.isActive)
            .forEach((permission: Permission) => {
              permissions.add(permission.code);
            });
        }
      });

    return Array.from(permissions);
  }

  async checkUserPermission(
    userId: string,
    permissionCode: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.includes(permissionCode);
  }

  async getUsersByPermission(
    permissionCode: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: User[];
    total: number;
  }> {
    const { limit = 10, offset = 0 } = paginationDto;

    const [data, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('permission.code = :permissionCode', { permissionCode })
      .andWhere('permission.isActive = true')
      .andWhere('role.isActive = true')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { data, total };
  }

  async syncUserDefaultRoles(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    // Si el usuario no tiene roles, asignar el rol por defecto
    if (!user.roles || user.roles.length === 0) {
      const defaultRole = await this.roleRepository.findOne({
        where: { code: 'USER' },
      });

      if (defaultRole) {
        user.roles = [defaultRole];
        return await this.userRepository.save(user);
      }
    }

    return user;
  }
}
