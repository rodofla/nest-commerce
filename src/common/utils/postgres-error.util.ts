// src/common/utils/postgres-error.util.ts

interface PostgresError {
  driverError: {
    code: string;
    detail: string;
  };
}

export function isPostgresError(error: unknown): error is PostgresError {
  // Verificar que error es un objeto válido
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  // Verificar que tiene la propiedad driverError
  if (!('driverError' in error)) {
    return false;
  }

  const { driverError } = error as { driverError: unknown };

  // Verificar que driverError es un objeto válido
  if (typeof driverError !== 'object' || driverError === null) {
    return false;
  }

  // Verificar que driverError tiene las propiedades code y detail
  if (!('code' in driverError) || !('detail' in driverError)) {
    return false;
  }

  const { code, detail } = driverError as { code: unknown; detail: unknown };

  // Verificar que code y detail son strings
  return typeof code === 'string' && typeof detail === 'string';
}
