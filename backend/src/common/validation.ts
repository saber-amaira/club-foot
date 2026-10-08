import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

/**
 * Réponse d'erreur uniforme : { message, erreurs: { champ: "message" } }
 * (c'est ce format que lit le frontend pour afficher les erreurs sous chaque champ).
 */
export function creerValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const erreurs: Record<string, string> = {};
      for (const erreur of errors) {
        const premier = Object.values(erreur.constraints ?? {})[0];
        if (premier) {
          erreurs[erreur.property] = premier;
        }
      }
      return new BadRequestException({ message: 'Données invalides', erreurs });
    },
  });
}
