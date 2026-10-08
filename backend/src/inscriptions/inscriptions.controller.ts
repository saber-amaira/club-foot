import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { Inscription } from './inscription.entity';
import { InscriptionCreee, InscriptionsService } from './inscriptions.service';

@Controller('inscriptions')
export class InscriptionsController {
  constructor(private readonly service: InscriptionsService) {}

  /** Public : les familles s'inscrivent sans compte. */
  @Post()
  creer(@Body() dto: CreateInscriptionDto): Promise<InscriptionCreee> {
    return this.service.creer(dto);
  }

  /** Réservé au club : contient les coordonnées des parents. */
  @Get()
  @UseGuards(AdminGuard)
  lister(): Promise<Inscription[]> {
    return this.service.lister();
  }
}
