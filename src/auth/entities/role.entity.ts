import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, unique: true })
  name: string;

  @Column('varchar', { length: 100, unique: true })
  code: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('integer', { default: 0 })
  priority: number; // Para jerarquía de roles (mayor número = mayor prioridad)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToMany('Permission', 'roles', {
    cascade: true,
    eager: false,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: any[];

  @ManyToMany('User', 'roles')
  users: any[];
}
