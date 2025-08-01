import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsToRoleDto,
  RemovePermissionsFromRoleDto,
} from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Protected } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(AuthGuard(), PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Create a new role with optional permissions',
  })
  @ApiCreatedResponse({
    description: 'Role created successfully',
    // TODO: Add role response schema
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or role code already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('ROLE_CREATE')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieve paginated list of roles with their permissions',
  })
  @ApiOkResponse({
    description: 'Roles retrieved successfully',
    // TODO: Add paginated roles response schema
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
    description: 'Number of roles to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of roles to skip',
    example: 0,
  })
  @Protected('ROLE_READ')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.roleService.findAll(paginationDto);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active roles',
    description: 'Retrieve all active roles',
  })
  @ApiOkResponse({
    description: 'Active roles retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('ROLE_READ')
  getActiveRoles() {
    return this.roleService.getActiveRoles();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieve a specific role with its permissions',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Role found',
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
  @Protected('ROLE_READ')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Get('by-code/:code')
  @ApiOperation({
    summary: 'Get role by code',
    description: 'Retrieve a role by its unique code',
  })
  @ApiParam({
    name: 'code',
    description: 'Role code',
    example: 'ADMIN',
  })
  @ApiOkResponse({
    description: 'Role found',
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
  @Protected('ROLE_READ')
  findByCode(@Param('code') code: string) {
    return this.roleService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role',
    description: 'Update role information',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Role updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
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
  @Protected('ROLE_UPDATE')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete role',
    description: 'Remove a role from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Role deleted successfully',
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
  @Protected('ROLE_DELETE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions/assign')
  @ApiOperation({
    summary: 'Assign permissions to role',
    description: 'Add permissions to an existing role',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Permissions assigned successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid permission IDs or role not found',
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
  @Protected('ROLE_UPDATE')
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignPermissionsDto: AssignPermissionsToRoleDto,
  ) {
    return this.roleService.assignPermissions(
      id,
      assignPermissionsDto.permissionIds,
    );
  }

  @Post(':id/permissions/remove')
  @ApiOperation({
    summary: 'Remove permissions from role',
    description: 'Remove permissions from an existing role',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Permissions removed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid permission IDs or role not found',
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
  @Protected('ROLE_UPDATE')
  removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removePermissionsDto: RemovePermissionsFromRoleDto,
  ) {
    return this.roleService.removePermissions(
      id,
      removePermissionsDto.permissionIds,
    );
  }
}
