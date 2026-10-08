import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';

function memeValeur(a: string, b: string): boolean {
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * Protège la liste des inscrits (données d'enfants) par une clé partagée ADMIN_KEY,
 * envoyée dans l'en-tête x-admin-key. Sans ADMIN_KEY configurée, l'accès est refusé.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const attendue = this.config.get<string>('ADMIN_KEY');
    const recue = context.switchToHttp().getRequest<Request>().header('x-admin-key');

    if (!attendue || !recue || !memeValeur(attendue, recue)) {
      throw new UnauthorizedException('Clé administrateur invalide');
    }
    return true;
  }
}
