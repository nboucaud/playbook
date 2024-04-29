import { NestFactory } from '@nestjs/core';
import { Controller, Get, Module } from '@nestjs/common';

import { renderApp } from './app';

@Controller()
class Renderer {
  @Get()
  async render() {
    const stream = await renderApp();
    return stream;
  }
}

@Module({
  controllers: [Renderer],
})
class RootApp {}

const app = await NestFactory.create(RootApp);

app.listen(3000);
