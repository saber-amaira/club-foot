import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SanteController } from './sante.controller';
import { Inscription } from './inscriptions/inscription.entity';
import { InscriptionsModule } from './inscriptions/inscriptions.module';
import { CreateInscription1760000000000 } from './migrations/1760000000000-create-inscription';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        url: config.get<string>(
          'DATABASE_URL',
          'postgres://clubfoot:clubfoot@localhost:5432/clubfoot',
        ),
        ssl: config.get<string>('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        entities: [Inscription],
        migrations: [CreateInscription1760000000000],
        // Le schéma est géré uniquement par les migrations, appliquées au démarrage
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    InscriptionsModule,
  ],
  controllers: [SanteController],
})
export class AppModule {}
