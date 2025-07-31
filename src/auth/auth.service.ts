import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, In } from 'typeorm';

import { User, Role } from './entities';
import { BaseService } from 'src/common/services/base.service';
import { IHashingAdapter } from './adapters/hashing-adapter.interface';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserRoleService } from './services/user-role.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @Inject('HASHING_ADAPTER')
    private readonly hasher: IHashingAdapter,

    private readonly jwtService: JwtService,
    private readonly userRoleService: UserRoleService,
  ) {
    super('AuthService');
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, roleIds, ...userData } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...userData,
        password: await this.hasher.hash(password),
      });

      // Asignar roles si se proporcionan
      if (roleIds && roleIds.length > 0) {
        const roles = await this.roleRepository.find({
          where: { id: In(roleIds), isActive: true },
        });

        if (roles.length !== roleIds.length) {
          throw new UnauthorizedException(
            'One or more roles not found or inactive',
          );
        }

        user.roles = roles;
      } else {
        // Asignar rol por defecto
        const defaultRole = await this.roleRepository.findOne({
          where: { code: 'USER' },
        });

        if (defaultRole) {
          user.roles = [defaultRole];
        }
      }

      const savedUser = await this.userRepository.save(user);

      // Actualizar la última vez que se logueó
      savedUser.lastLoginAt = new Date();
      await this.userRepository.save(savedUser);

      const userResponse = plainToInstance(UserResponseDto, savedUser, {
        excludeExtraneousValues: true,
      });

      return {
        ...userResponse,
        token: this.getJwtToken({ id: userResponse.id }),
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, isActive: true },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials (email)');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    if (!(await this.hasher.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials (password)');
    }

    // Actualizar la última vez que se logueó
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      ...userResponse,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    return await this.userRoleService.getUserPermissions(userId);
  }

  async checkUserPermission(
    userId: string,
    permissionCode: string,
  ): Promise<boolean> {
    return await this.userRoleService.checkUserPermission(
      userId,
      permissionCode,
    );
  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
