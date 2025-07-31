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
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Protected } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';
import { PermissionAction, PermissionResource } from '../entities';

@Controller('permissions')
@UseGuards(AuthGuard(), PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Protected('PERMISSION_CREATE')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @Protected('PERMISSION_READ')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.permissionService.findAll(paginationDto);
  }

  @Get('active')
  @Protected('PERMISSION_READ')
  getActivePermissions() {
    return this.permissionService.getActivePermissions();
  }

  @Get('by-resource/:resource')
  @Protected('PERMISSION_READ')
  getByResource(@Param('resource') resource: string) {
    return this.permissionService.getByResource(resource as PermissionResource);
  }

  @Get('by-action/:action')
  @Protected('PERMISSION_READ')
  getByAction(@Param('action') action: string) {
    return this.permissionService.getByAction(action as PermissionAction);
  }

  @Get(':id')
  @Protected('PERMISSION_READ')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.findOne(id);
  }

  @Get('by-code/:code')
  @Protected('PERMISSION_READ')
  findByCode(@Param('code') code: string) {
    return this.permissionService.findByCode(code);
  }

  @Patch(':id')
  @Protected('PERMISSION_UPDATE')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Protected('PERMISSION_DELETE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionService.remove(id);
  }

  @Post('seed')
  @Protected('SYSTEM_MANAGE')
  createBulkPermissions() {
    return this.permissionService.createBulkPermissions();
  }
}
