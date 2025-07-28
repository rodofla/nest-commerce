# Test Upload Example

## Usando cURL

```bash
# Subir una imagen
curl -X POST \
  http://localhost:3000/files/product \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/image.jpg"

# Eliminar una imagen (reemplaza 'products/1234567890' con el publicId real)
curl -X DELETE \
  http://localhost:3000/files/product/products%2F1234567890
```

## Usando Postman

1. **Subir imagen**:
   - Method: POST
   - URL: `http://localhost:3000/files/product`
   - Body: form-data
   - Key: `file` (tipo: File)
   - Value: selecciona tu imagen

2. **Eliminar imagen**:
   - Method: DELETE
   - URL: `http://localhost:3000/files/product/{publicId}`
   - Reemplaza `{publicId}` con el ID recibido en la respuesta de subida

## Respuestas Esperadas

### Upload Success

```json
{
  "fileName": "mi-imagen.jpg",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/abcd1234.webp",
  "publicId": "products/abcd1234",
  "message": "File uploaded successfully to Cloudinary."
}
```

### Delete Success

```json
{
  "message": "Image deleted successfully from Cloudinary."
}
```
