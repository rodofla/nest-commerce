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

import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Protected } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionAction, PermissionResource } from '../entities';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
@UseGuards(AuthGuard(), PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new permission',
    description: 'Create a new permission for the RBAC system',
  })
  @ApiCreatedResponse({
    description: 'Permission created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or permission code already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_CREATE')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
    description: 'Retrieve paginated list of permissions',
  })
  @ApiOkResponse({
    description: 'Permissions retrieved successfully',
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
    description: 'Number of permissions to return',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of permissions to skip',
    example: 0,
  })
  @Protected('PERMISSION_READ')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active permissions',
    description: 'Retrieve all active permissions',
  })
  @ApiOkResponse({
    description: 'Active permissions retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_READ')
  getActivePermissions() {
    return this.permissionService.getActivePermissions();
  }

  @Get('by-resource/:resource')
  @ApiOperation({
    summary: 'Get permissions by resource',
    description: 'Retrieve all permissions for a specific resource',
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource name',
    enum: PermissionResource,
    example: 'PRODUCT',
  })
  @ApiOkResponse({
    description: 'Permissions retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_READ')
  getByResource(@Param('resource') resource: string) {
    return this.permissionService.getByResource(resource as PermissionResource);
  }

  @Get('by-action/:action')
  @ApiOperation({
    summary: 'Get permissions by action',
    description: 'Retrieve all permissions for a specific action',
  })
  @ApiParam({
    name: 'action',
    description: 'Action name',
    enum: PermissionAction,
    example: 'CREATE',
  })
  @ApiOkResponse({
    description: 'Permissions retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_READ')
  getByAction(@Param('action') action: string) {
    return this.permissionService.getByAction(action as PermissionAction);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission by ID',
    description: 'Retrieve a specific permission',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Permission found',
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_READ')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.findOne(id);
  }

  @Get('by-code/:code')
  @ApiOperation({
    summary: 'Get permission by code',
    description: 'Retrieve a permission by its unique code',
  })
  @ApiParam({
    name: 'code',
    description: 'Permission code',
    example: 'PRODUCT_CREATE',
  })
  @ApiOkResponse({
    description: 'Permission found',
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_READ')
  findByCode(@Param('code') code: string) {
    return this.permissionService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update permission',
    description: 'Update permission information',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Permission updated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_UPDATE')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete permission',
    description: 'Remove a permission from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Permission deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Permission not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @Protected('PERMISSION_DELETE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.remove(id);
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed bulk permissions',
    description: 'Create all standard permissions for the system (admin only)',
  })
  @ApiCreatedResponse({
    description: 'Permissions seeded successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - system management required',
  })
  @Protected('SYSTEM_MANAGE')
  createBulkPermissions() {
    return this.permissionService.createBulkPermissions();
  }
}
