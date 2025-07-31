import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

/**
 * Decorador unificado para autenticación y autorización
 *
 * Uso:
 * - @Protected() - Solo autenticación (usuario logueado)
 * - @Protected(CommonPermissions.USER_READ) - Autenticación + permiso específico
 * - @Protected(CommonPermissions.USER_READ, CommonPermissions.USER_UPDATE) - Autenticación + múltiples permisos
 */
export function Protected(...permissions: string[]): MethodDecorator {
  if (permissions.length === 0) {
    // Solo autenticación
    return applyDecorators(UseGuards(AuthGuard()));
  }

  // Autenticación + autorización por permisos
  return applyDecorators(
    RequirePermissions(...permissions),
    UseGuards(AuthGuard(), PermissionsGuard),
  );
}
