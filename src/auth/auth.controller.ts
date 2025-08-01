import { Controller, Post, Body, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto, UserResponseDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { Protected } from './decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with optional role assignment',
  })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Authenticate user',
    description: 'Authenticates user credentials and returns JWT token',
  })
  @ApiOkResponse({
    description: 'User successfully authenticated',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @ApiOperation({
    summary: 'Check authentication status',
    description: 'Returns current user information if authenticated',
  })
  @ApiOkResponse({
    description: 'Current user information',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or token invalid',
  })
  @ApiBearerAuth('access-token')
  @Protected()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
