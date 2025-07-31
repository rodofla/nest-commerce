import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from './roles.decorator';
import { RequirePermissions } from './permissions.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(UseGuards(AuthGuard()), Roles(...roles));
}

export function AuthWithPermissions(...permissions: string[]) {
  return applyDecorators(
    UseGuards(AuthGuard(), PermissionsGuard),
    RequirePermissions(...permissions),
  );
}

export function AuthWithRoles(...roles: string[]) {
  return applyDecorators(UseGuards(AuthGuard(), RolesGuard), Roles(...roles));
}

export function AuthWithRolesAndPermissions(
  roles: string[],
  permissions: string[],
) {
  return applyDecorators(
    UseGuards(AuthGuard(), RolesGuard, PermissionsGuard),
    Roles(...roles),
    RequirePermissions(...permissions),
  );
}
