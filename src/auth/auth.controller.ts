import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from 'src/common/decorators/raw-headers.decorator';
import { RequirePermissions } from './decorators';
import { PermissionsGuard } from './guards/permissions.guard';
import { CommonPermissions } from './interfaces/valid-roles';

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

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[],
  ) {
    return { message: 'This is a private route', user, rawHeaders };
  }

  @Get('private2')
  @RequirePermissions(CommonPermissions.USER_READ)
  @UseGuards(AuthGuard(), PermissionsGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
      message: 'This route requires USER_READ permission',
    };
  }

  @Get('private3')
  @RequirePermissions(CommonPermissions.SYSTEM_MANAGE)
  @UseGuards(AuthGuard(), PermissionsGuard)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
      message: 'This route requires SYSTEM_MANAGE permission (admin only)',
    };
  }
}
