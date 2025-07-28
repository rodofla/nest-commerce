import { Logger } from '@nestjs/common';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../../products/entities/product.entity';
import { ProductImage } from '../../products/entities/product-image.entity';

export default class ProductSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Seed solo permitido en desarrollo.');
      process.exit(1);
    }

    await dataSource.query(
      'TRUNCATE TABLE "product_images", "products" RESTART IDENTITY CASCADE;',
    );

    const productFactory = factoryManager.get(Product);
    const productImageFactory = factoryManager.get(ProductImage);

    // Crear 30 productos
    for (let i = 0; i < 30; i++) {
      const product = await productFactory.make();
      // Entre 1 y 4 imágenes por producto
      product.images = await productImageFactory.saveMany(
        faker.number.int({ min: 1, max: 4 }),
      );
      await dataSource.getRepository(Product).save(product);
    }

    Logger.log(
      `✅ Seed ejecutado con éxito: 30 productos y sus imágenes fueron generados!`,
      'ProductSeeder',
    );
  }
}
