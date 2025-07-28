# Files Module - Sistema de Subida de Archivos

Este módulo implementa un sistema flexible de subida de archivos usando el **patrón Strategy** y **Factory Method** para mantener el código limpio y desacoplado.

## Arquitectura

### Patrones de Diseño Utilizados

1. **Strategy Pattern**: Diferentes estrategias de subida (Cloudinary, Local, AWS S3)
2. **Factory Method**: Factory para crear las estrategias apropiadas
3. **Dependency Injection**: Para mantener el bajo acoplamiento

### Estructura

```
src/files/
├── controllers/
│   └── files.controller.ts
├── services/
│   └── files.service.ts
├── strategies/
│   ├── cloudinary-upload.strategy.ts
│   └── local-upload.strategy.ts
├── factories/
│   └── file-upload.factory.ts
├── interfaces/
│   └── file-upload.interface.ts
└── files.module.ts
```

## Configuración

### Variables de Entorno

```bash
# Upload Provider (cloudinary, local, aws-s3)
UPLOAD_PROVIDER=cloudinary

# Cloudinary (solo si usas Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Setup

1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtén tus credenciales desde el dashboard
3. Agrega las variables de entorno a tu archivo `.env`

## Uso

### Endpoints Disponibles

#### Subir Imagen de Producto

```http
POST /files/product
Content-Type: multipart/form-data

file: [archivo de imagen]
```

**Respuesta:**

```json
{
  "fileName": "imagen.jpg",
  "url": "https://res.cloudinary.com/...",
  "publicId": "products/123456789",
  "message": "File uploaded successfully to Cloudinary."
}
```

#### Eliminar Imagen de Producto

```http
DELETE /files/product/:publicId
```

**Respuesta:**

```json
{
  "message": "Image deleted successfully from Cloudinary."
}
```

### Validaciones

- **Tamaño máximo**: 1MB
- **Tipos permitidos**: image/\*
- **Transformaciones automáticas** (Cloudinary):
  - Redimensionado: máximo 800x800px
  - Formato: convertido a WebP
  - Calidad: automática

## Flexibilidad del Sistema

### Cambiar de Proveedor

Para cambiar de Cloudinary a almacenamiento local, simplemente cambia la variable:

```bash
UPLOAD_PROVIDER=local
```

### Agregar Nuevas Estrategias

1. Implementa la interfaz `FileUploadStrategy`:

```typescript
@Injectable()
export class AwsS3UploadStrategy implements FileUploadStrategy {
  async upload(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadResult> {
    // Implementación de AWS S3
  }

  async delete(publicId: string): Promise<void> {
    // Implementación de eliminación en S3
  }
}
```

2. Agrega la estrategia al Factory:

```typescript
case UploadProvider.AWS_S3:
case 'aws-s3':
  return this.s3Strategy;
```

3. Registra en el módulo:

```typescript
providers: [
  // ... otros providers
  AwsS3UploadStrategy,
];
```

## Ventajas de esta Arquitectura

1. **Código Limpio**: Separación clara de responsabilidades
2. **Flexibilidad**: Fácil cambio entre proveedores
3. **Extensibilidad**: Agregar nuevos proveedores sin modificar código existente
4. **Testeable**: Cada estrategia puede testearse independientemente
5. **Configuración Centralizada**: Un solo lugar para cambiar el proveedor

## Testing

```bash
# Instalar dependencias de testing si no están
pnpm add -D @types/jest jest supertest

# Ejecutar tests
pnpm test
```

## Ejemplo de Uso en Otros Servicios

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly filesService: FilesService) {}

  async createProductWithImage(
    createProductDto: CreateProductDto,
    file: Express.Multer.File,
  ) {
    // Subir imagen
    const uploadResult = await this.filesService.uploadProductImage(file);

    // Crear producto con URL de imagen
    const product = this.productRepository.create({
      ...createProductDto,
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
    });

    return this.productRepository.save(product);
  }
}
```

## Notas Importantes

- Las imágenes se suben con transformaciones automáticas para optimizar el rendimiento
- El `publicId` se usa para eliminar imágenes posteriormente
- El sistema es completamente asíncrono
- Manejo robusto de errores en todas las estrategias
