import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @deprecated Use @RequirePermissions() with @UseGuards(AuthGuard(), PermissionsGuard) instead
 * This decorator is kept for backward compatibility only
 */
export function Auth() {
  return applyDecorators(UseGuards(AuthGuard()));
}
