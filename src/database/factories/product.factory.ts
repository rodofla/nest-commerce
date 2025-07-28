import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { Product } from '../../products/entities/product.entity';

export default setSeederFactory(Product, () => {
  const product = new Product();
  product.title = faker.commerce.productName();
  product.price = Number(faker.commerce.price());
  product.description = faker.commerce.productDescription();
  product.slug = faker.helpers.slugify(product.title).toLowerCase();
  product.stock = faker.number.int({ min: 1, max: 100 });
  product.sizes = faker.helpers.arrayElements(
    ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    faker.number.int({ min: 1, max: 3 }),
  );
  product.gender = faker.helpers.arrayElement([
    'men',
    'women',
    'kid',
    'unisex',
  ]);
  product.tags = faker.helpers.arrayElements(
    ['summer', 'winter', 'new', 'sale', 'sport', 'casual'],
    faker.number.int({ min: 1, max: 3 }),
  );

  return product;
});
