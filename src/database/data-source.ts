import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';

// Usa variables de entorno para mayor seguridad y portabilidad
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // IMPORTANTE: Ajusta las rutas según tu estructura real
  entities: [
    Product,
    ProductImage,
    // puedes agregar más entidades aquí
  ],
  // Si usas migraciones, ponlas aquí
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true', // true solo para desarrollo (nunca en prod)
  logging: false,
});
