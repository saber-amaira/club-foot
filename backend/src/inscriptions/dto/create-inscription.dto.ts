import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsISO8601, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const nettoyer = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const nettoyerEmail = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateInscriptionDto {
  @Transform(nettoyer)
  @IsString({ message: 'Le prénom est obligatoire' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @MaxLength(100, { message: '100 caractères maximum' })
  prenom: string;

  @Transform(nettoyer)
  @IsString({ message: 'Le nom est obligatoire' })
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(100, { message: '100 caractères maximum' })
  nom: string;

  @Transform(nettoyer)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date invalide (format AAAA-MM-JJ)' })
  @IsISO8601({ strict: true }, { message: 'Date invalide' })
  dateNaissance: string;

  @Transform(nettoyerEmail)
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(254, { message: '254 caractères maximum' })
  emailParent: string;

  @Transform(nettoyer)
  @Matches(/^[0-9+()\s.-]{6,20}$/, { message: 'Téléphone invalide' })
  telephoneParent: string;
}
