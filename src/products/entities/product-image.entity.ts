import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  @Column({ nullable: true })
  publicId: string; // Para Cloudinary/servicios externos

  @Column({ nullable: true })
  originalName: string; // Nombre original del archivo

  @Column({ nullable: true })
  format: string; // jpg, png, webp, etc.

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  bytes: number; // Tamaño del archivo

  @Column({ default: true })
  isActive: boolean; // Para soft delete

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
