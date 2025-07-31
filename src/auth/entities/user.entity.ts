import { Product } from 'src/products/entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('bool', { default: false })
  emailVerified: boolean;

  @Column('timestamp', { nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToMany('Role', 'users', {
    cascade: false,
    eager: true, // Cargar roles automáticamente
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @OneToMany('Product', 'user')
  products: Product[];

  // Métodos de validación y normalización
  @BeforeInsert()
  checkFieldsBeforeInsert(): void {
    this.normalizeFields();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(): void {
    this.normalizeFields();
  }

  private normalizeFields(): void {
    this.email = this.email.toLowerCase().trim();
  }

  // Métodos de negocio
  hasRole(roleCode: string): boolean {
    if (!this.roles || this.roles.length === 0) {
      return false;
    }
    return this.roles.some((role) => role.code === roleCode && role.isActive);
  }

  hasAnyRole(roleCodes: string[]): boolean {
    return roleCodes.some((code) => this.hasRole(code));
  }

  hasPermission(permissionCode: string): boolean {
    if (!this.roles || this.roles.length === 0) {
      return false;
    }

    return this.roles.some((role) => {
      if (!role.permissions || role.permissions.length === 0) {
        return false;
      }
      return role.permissions.some(
        (permission: Permission) =>
          permission.code === permissionCode && permission.isActive,
      );
    });
  }

  hasAnyPermission(permissionCodes: string[]): boolean {
    return permissionCodes.some((code) => this.hasPermission(code));
  }

  getHighestPriorityRole(): Role | null {
    if (!this.roles || this.roles.length === 0) return null;

    return this.roles
      .filter((role) => role.isActive)
      .reduce((highest, current) =>
        current.priority > highest.priority ? current : highest,
      );
  }
}
