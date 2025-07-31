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
import { UserRoleService } from '../services/user-role.service';
import { AssignRolesDto, RemoveRolesDto } from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Protected } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('user-roles')
@UseGuards(AuthGuard(), PermissionsGuard)
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post(':userId/assign')
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
  @Protected('USER_READ')
  getUsersWithRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRoleService.getUsersWithRole(roleId, paginationDto);
  }

  @Get(':userId/permissions')
  @Protected('USER_READ')
  getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRoleService.getUserPermissions(userId);
  }

  @Get('permission/:permissionCode/users')
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
  @Protected('USER_UPDATE')
  syncDefaultRoles(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userRoleService.syncUserDefaultRoles(userId);
  }
}
