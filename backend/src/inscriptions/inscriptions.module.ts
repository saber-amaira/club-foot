import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from './admin.guard';
import { Inscription } from './inscription.entity';
import { InscriptionsController } from './inscriptions.controller';
import { InscriptionsService } from './inscriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inscription])],
  controllers: [InscriptionsController],
  providers: [InscriptionsService, AdminGuard],
})
export class InscriptionsModule {}
