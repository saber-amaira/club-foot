import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from './admin.guard';

function contexte(cle?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ header: (nom: string) => (nom === 'x-admin-key' ? cle : undefined) }),
    }),
  } as unknown as ExecutionContext;
}

function guard(cleAttendue?: string): AdminGuard {
  const config = { get: () => cleAttendue } as unknown as ConfigService;
  return new AdminGuard(config);
}

describe('AdminGuard', () => {
  it('laisse passer la bonne clé', () => {
    expect(guard('secret').canActivate(contexte('secret'))).toBe(true);
  });

  it('refuse une mauvaise clé', () => {
    expect(() => guard('secret').canActivate(contexte('autre'))).toThrow(UnauthorizedException);
  });

  it("refuse l'absence de clé", () => {
    expect(() => guard('secret').canActivate(contexte())).toThrow(UnauthorizedException);
  });

  it("refuse tout quand ADMIN_KEY n'est pas configurée", () => {
    expect(() => guard(undefined).canActivate(contexte('nimporte'))).toThrow(
      UnauthorizedException,
    );
  });
});
