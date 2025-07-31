import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PermissionResource {
  USER = 'user',
  PRODUCT = 'product',
  ORDER = 'order',
  CATEGORY = 'category',
  ROLE = 'role',
  PERMISSION = 'permission',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Todos los permisos sobre el recurso
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string; // Ej: "users:create", "products:read"

  @Column('varchar', { length: 50, unique: true })
  code: string; // Ej: "USERS_CREATE", "PRODUCTS_READ"

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToMany('Role', 'permissions')
  roles: any[];
}
