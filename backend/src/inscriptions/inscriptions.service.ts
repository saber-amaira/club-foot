import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { AGE_MAX, AGE_MIN, calculerAge, categoriePourAge } from './categories';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { Inscription } from './inscription.entity';

/** Réponse à l'inscription : volontairement sans les coordonnées du parent. */
export interface InscriptionCreee {
  id: number;
  prenom: string;
  nom: string;
  dateNaissance: string;
  categorie: string;
  createdAt: Date;
}

const CODE_PG_VIOLATION_UNICITE = '23505';

function estDoublon(erreur: unknown): boolean {
  return (
    erreur instanceof QueryFailedError &&
    (erreur.driverError as { code?: string } | undefined)?.code === CODE_PG_VIOLATION_UNICITE
  );
}

@Injectable()
export class InscriptionsService {
  constructor(
    @InjectRepository(Inscription)
    private readonly repository: Repository<Inscription>,
  ) {}

  async creer(dto: CreateInscriptionDto): Promise<InscriptionCreee> {
    const categorie = categoriePourAge(calculerAge(dto.dateNaissance));
    if (categorie === null) {
      throw new BadRequestException({
        message: 'Données invalides',
        erreurs: { dateNaissance: `L'enfant doit avoir entre ${AGE_MIN} et ${AGE_MAX} ans` },
      });
    }

    try {
      const enregistree = await this.repository.save(
        this.repository.create({
          prenom: dto.prenom,
          nom: dto.nom,
          dateNaissance: dto.dateNaissance,
          categorie,
          emailParent: dto.emailParent,
          telephoneParent: dto.telephoneParent,
        }),
      );
      return {
        id: enregistree.id,
        prenom: enregistree.prenom,
        nom: enregistree.nom,
        dateNaissance: enregistree.dateNaissance,
        categorie: enregistree.categorie,
        createdAt: enregistree.createdAt,
      };
    } catch (erreur) {
      if (estDoublon(erreur)) {
        throw new ConflictException({ message: 'Cette inscription existe déjà' });
      }
      throw erreur;
    }
  }

  lister(): Promise<Inscription[]> {
    return this.repository.find({ order: { createdAt: 'DESC', id: 'DESC' } });
  }
}
