import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { ProductImage } from '../../products/entities/product-image.entity';

export default setSeederFactory(ProductImage, () => {
  const image = new ProductImage();
  image.url = faker.image.urlPicsumPhotos();
  return image;
});
