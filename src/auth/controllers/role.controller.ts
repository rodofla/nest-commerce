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
import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsToRoleDto,
  RemovePermissionsFromRoleDto,
} from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { RequirePermissions } from '../decorators';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('roles')
@UseGuards(AuthGuard(), PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions('ROLE_CREATE')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('ROLE_READ')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.roleService.findAll(paginationDto);
  }

  @Get('active')
  @RequirePermissions('ROLE_READ')
  getActiveRoles() {
    return this.roleService.getActiveRoles();
  }

  @Get(':id')
  @RequirePermissions('ROLE_READ')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Get('by-code/:code')
  @RequirePermissions('ROLE_READ')
  findByCode(@Param('code') code: string) {
    return this.roleService.findByCode(code);
  }

  @Patch(':id')
  @RequirePermissions('ROLE_UPDATE')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('ROLE_DELETE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.remove(id);
  }

  @Post(':id/permissions/assign')
  @RequirePermissions('ROLE_UPDATE')
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
  @RequirePermissions('ROLE_UPDATE')
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
