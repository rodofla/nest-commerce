import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { Protected } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Protected()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
