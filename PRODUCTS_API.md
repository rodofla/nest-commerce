# API Endpoints - Products con Sistema de Imágenes Mejorado (Clean Architecture)

## 🚀 **Endpoints Disponibles**

### **1. Crear Producto (sin imágenes)**

```http
POST /products
```

### **2. ⭐ Crear Producto CON Imágenes (Flujo completo)**

```http
POST /products/with-images
Content-Type: multipart/form-data

# Datos del producto + archivos en una sola llamada
title: "Laptop HP"
price: 999.99
gender: "unisex"
files: [imagen1.jpg, imagen2.png]
```

### **3. Actualizar Producto (sin imágenes)**

```http
PATCH /products/{id}
```

### **4. ⭐ Actualizar Producto CON Imágenes**

```http
PATCH /products/{id}/with-images
Content-Type: multipart/form-data

imageAction: "add" | "replace"  # add: agregar, replace: reemplazar todas
files: [nuevas-imagenes.jpg]
```

### **5. Subir Imágenes por Separado**

```http
POST /products/{id}/images
```

### **6. Eliminar Imagen Específica**

```http
DELETE /products/images/{imageId}
```

## 🏗️ **Arquitectura Clean Code**

### **Separación de Responsabilidades:**

- **ProductsService**: Solo productos
- **ProductImageService**: Orquestador productos + imágenes
- **FilesService**: Solo manejo de archivos

### **Ventajas:**

✅ Single Responsibility Principle  
✅ Testeable independientemente  
✅ Código más mantenible  
✅ Fácil extensión

### **Crear Producto (sin imágenes)**

```http
POST /products
Content-Type: application/json

{
  "title": "Laptop HP Pavilion",
  "price": 999.99,
  "description": "Laptop gaming de alta gama",
  "gender": "unisex",
  "sizes": ["15-inch", "17-inch"],
  "tags": ["gaming", "laptop", "hp"]
}
```

### **Subir Imágenes a un Producto**

```http
POST /products/{productId}/images
Content-Type: multipart/form-data

files: [imagen1.jpg, imagen2.png, ...] (máximo 10 imágenes, 2MB cada una)
folder: "products" (opcional)
```

**Respuesta:**

```json
{
  "message": "3 images uploaded successfully",
  "images": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/tu-cloud/image/upload/v123/products/abc123.webp",
      "publicId": "products/abc123",
      "originalName": "laptop-hp.jpg",
      "format": "webp",
      "width": 800,
      "height": 600,
      "bytes": 45678
    }
  ]
}
```

### **Eliminar una Imagen Específica**

```http
DELETE /products/images/{imageId}
```

**Respuesta:**

```json
{
  "message": "Image deleted successfully"
}
```

### **Obtener Todos los Productos (con imágenes completas)**

```http
GET /products?limit=10&offset=0
```

**Respuesta:**

```json
[
  {
    "id": "uuid-product",
    "title": "Laptop HP Pavilion",
    "price": 999.99,
    "description": "Laptop gaming de alta gama",
    "images": [
      {
        "id": 1,
        "url": "https://res.cloudinary.com/tu-cloud/image/upload/v123/products/abc123.webp",
        "originalName": "laptop-hp.jpg",
        "format": "webp",
        "width": 800,
        "height": 600,
        "bytes": 45678
      }
    ]
  }
]
```

### **Obtener Producto Específico (con imágenes)**

```http
GET /products/{id}
GET /products/{slug}
GET /products/{title}
```

### **Actualizar Producto (sin afectar imágenes)**

```http
PATCH /products/{id}
Content-Type: application/json

{
  "title": "Nuevo título",
  "price": 1299.99
}
```

### **Eliminar Producto (elimina también las imágenes)**

```http
DELETE /products/{id}
```

## 🔄 **Flujo Completo de Trabajo**

### **Escenario 1: Crear producto con imágenes**

```bash
# 1. Crear producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Laptop HP","price":999.99,"gender":"unisex"}'

# Respuesta: { "id": "uuid-123", ... }

# 2. Subir imágenes
curl -X POST http://localhost:3000/products/uuid-123/images \
  -F "files=@imagen1.jpg" \
  -F "files=@imagen2.png"
```

### **Escenario 2: Gestión de imágenes**

```bash
# Ver producto con imágenes
curl http://localhost:3000/products/uuid-123

# Eliminar imagen específica
curl -X DELETE http://localhost:3000/products/images/1

# Subir más imágenes
curl -X POST http://localhost:3000/products/uuid-123/images \
  -F "files=@nueva-imagen.jpg"
```

## 📊 **Datos Guardados en ProductImage**

La entidad `ProductImage` ahora guarda:

- ✅ **url**: URL pública de la imagen
- ✅ **publicId**: ID único para eliminar (ej: "products/abc123")
- ✅ **originalName**: Nombre original del archivo
- ✅ **format**: Formato de la imagen (webp, jpg, png)
- ✅ **width/height**: Dimensiones de la imagen
- ✅ **bytes**: Tamaño del archivo
- ✅ **isActive**: Para soft delete
- ✅ **createdAt**: Timestamp de creación

## 🎯 **Características del Sistema**

### **Validaciones:**

- Máximo 10 imágenes por upload
- Máximo 2MB por imagen
- Solo archivos de imagen (image/\*)

### **Transformaciones Automáticas (Cloudinary):**

- Redimensionado: máximo 800x800px
- Formato: convertido a WebP para optimización
- Calidad: automática

### **Transacciones:**

- Upload con transacciones de BD
- Rollback automático en caso de error
- Limpieza de archivos si falla la BD

### **Flexibilidad:**

- Cambiar proveedor (Cloudinary/Local) con variable de entorno
- Soft delete de imágenes
- Metadatos completos guardados

## 🛠️ **Configuración Requerida**

Asegúrate de tener en tu `.env`:

```bash
# Upload Provider
UPLOAD_PROVIDER=cloudinary

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```
