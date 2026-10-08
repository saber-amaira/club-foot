import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Utilisé par Render (healthCheckPath) : vérifie aussi la connexion à la base. */
@Controller('health')
export class SanteController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async verifier(): Promise<{ status: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException({ status: 'down' });
    }
  }
}
