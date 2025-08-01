import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nest Commerce API')
    .setDescription(
      'A comprehensive e-commerce API built with NestJS featuring RBAC authentication, product management, and file uploads',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication and user management endpoints')
    .addTag('Products', 'Product catalog management')
    .addTag('Files', 'File upload and management')
    .addTag('Roles', 'Role-based access control')
    .addTag('Permissions', 'Permission management')
    .addTag('User Roles', 'User role assignment and management')
    .addTag('RBAC Seeder', 'Database seeding for RBAC system')
    .addBearerAuth(
      {
        description: 'JWT Authorization header using the Bearer scheme',
        name: 'Authorization',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.nest-commerce.com', 'Production server')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        methodKey,
    });

  SwaggerModule.setup('api', app, documentFactory, {
    customSiteTitle: 'Nest Commerce API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
