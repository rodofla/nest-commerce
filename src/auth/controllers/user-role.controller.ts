import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { UserRoleService } from '../services/user-role.service';
import { AssignRolesDto, RemoveRolesDto } from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Protected } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('User Roles')
@ApiBearerAuth('access-token')
@Controller('user-roles')
@UseGuards(AuthGuard(), PermissionsGuard)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post(':userId/assign')
  @ApiOperation({
    summary: 'Assign roles to user',
    description: 'Add roles to a user (keeping existing roles)',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Roles assigned successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid role IDs or user not found',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('USER_UPDATE')
  assignRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userRoleService.assignRolesToUser(
      userId,
      assignRolesDto.roleIds,
    );
  }

  @Post(':userId/remove')
  @ApiOperation({
    summary: 'Remove roles from user',
    description: 'Remove specific roles from a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Roles removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid role IDs or user not found',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('USER_UPDATE')
  removeRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() removeRolesDto: RemoveRolesDto,
  ) {
    return this.userRoleService.removeRolesFromUser(
      userId,
      removeRolesDto.roleIds,
    );
  }

  @Post(':userId/replace')
  @ApiOperation({
    summary: 'Replace user roles',
    description: 'Replace all user roles with the provided ones',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Roles replaced successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid role IDs or user not found',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('USER_UPDATE')
  replaceRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.userRoleService.replaceUserRoles(
      userId,
      assignRolesDto.roleIds,
    );
  }

  @Get('role/:roleId/users')
  @ApiOperation({
    summary: 'Get users with specific role',
    description: 'Retrieve paginated list of users that have a specific role',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Role not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of users to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of users to skip',
    example: 0,
  })
  @Protected('USER_READ')
  getUsersWithRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRoleService.getUsersWithRole(roleId, paginationDto);
  }

  @Get(':userId/permissions')
  @ApiOperation({
    summary: 'Get user permissions',
    description:
      'Retrieve all permissions for a specific user (from their roles)',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'User permissions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example: 'PRODUCT_CREATE',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('USER_READ')
  getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRoleService.getUserPermissions(userId);
  }

  @Get('permission/:permissionCode/users')
  @ApiOperation({
    summary: 'Get users with specific permission',
    description:
      'Retrieve paginated list of users that have a specific permission',
  })
  @ApiParam({
    name: 'permissionCode',
    description: 'Permission code',
    example: 'PRODUCT_CREATE',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of users to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of users to skip',
    example: 0,
  })
  @Protected('USER_READ')
  getUsersByPermission(
    @Param('permissionCode') permissionCode: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRoleService.getUsersByPermission(
      permissionCode,
      paginationDto,
    );
  }

  @Post(':userId/sync-default-roles')
  @ApiOperation({
    summary: 'Sync user default roles',
    description: 'Ensure user has default system roles assigned',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Default roles synced successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('USER_UPDATE')
  syncDefaultRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRoleService.syncUserDefaultRoles(userId);
  }
}
