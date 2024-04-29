import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [],
})
class RootApp {}

const app = await NestFactory.create(RootApp);

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);
}

app.listen(3000);
