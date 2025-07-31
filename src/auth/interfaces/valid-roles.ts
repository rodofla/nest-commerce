/**
 * @deprecated Use Role entity with RBAC system instead
 */
export enum ValidRoles {
  admin = 'admin',
  superUser = 'super-user',
  user = 'user',
}

/**
 * Standard role codes for RBAC system
 */
export enum StandardRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
  GUEST = 'GUEST',
}

/**
 * Common permission codes for easy reference
 */
export enum CommonPermissions {
  // User permissions
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // Product permissions
  PRODUCT_CREATE = 'PRODUCT_CREATE',
  PRODUCT_READ = 'PRODUCT_READ',
  PRODUCT_UPDATE = 'PRODUCT_UPDATE',
  PRODUCT_DELETE = 'PRODUCT_DELETE',

  // File permissions
  FILE_CREATE = 'FILE_CREATE',
  FILE_READ = 'FILE_READ',
  FILE_UPDATE = 'FILE_UPDATE',
  FILE_DELETE = 'FILE_DELETE',

  // Order permissions
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_READ = 'ORDER_READ',
  ORDER_UPDATE = 'ORDER_UPDATE',
  ORDER_DELETE = 'ORDER_DELETE',

  // Category permissions
  CATEGORY_CREATE = 'CATEGORY_CREATE',
  CATEGORY_READ = 'CATEGORY_READ',
  CATEGORY_UPDATE = 'CATEGORY_UPDATE',
  CATEGORY_DELETE = 'CATEGORY_DELETE',

  // Role permissions
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_READ = 'ROLE_READ',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',

  // Permission permissions
  PERMISSION_CREATE = 'PERMISSION_CREATE',
  PERMISSION_READ = 'PERMISSION_READ',
  PERMISSION_UPDATE = 'PERMISSION_UPDATE',
  PERMISSION_DELETE = 'PERMISSION_DELETE',

  // System permissions
  SYSTEM_MANAGE = 'SYSTEM_MANAGE',
}
