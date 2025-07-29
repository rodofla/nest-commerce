import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { BaseService } from 'src/common/services/base.service';
import { IHashingAdapter } from './adapters/hashing-adapter.interface';
import { LoginUserDto, CreateUserDto } from './dto';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject('HASHING_ADAPTER')
    private readonly hasher: IHashingAdapter,
  ) {
    super('AuthService');
  }

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    try {
      const user = this.userRepository.create({
        ...userData,
        password: await this.hasher.hash(password),
      });

      await this.userRepository.save(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: __omit, ...userWithoutPassword } = user;
      return userWithoutPassword;
      //TODO: Retornar el JWT de Acceso
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials (email)');
    }

    if (!(await this.hasher.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials (password)');
    }

    return user;
    //TODO: Retornar el JWT de Acceso
  }
}
