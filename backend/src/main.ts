import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  // En production, Nest sert aussi le build Angular (dossier public/ à côté de dist/)
  const publicDir = join(__dirname, '..', 'public');
  const indexHtml = join(publicDir, 'index.html');
  if (existsSync(indexHtml)) {
    app.useStaticAssets(publicDir);
    // Les routes Angular (/inscription, /inscrits…) renvoient index.html
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !extname(req.path)) {
        res.sendFile(indexHtml);
        return;
      }
      next();
    });
  }

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
