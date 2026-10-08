export const CATEGORIES = [
  { code: 'U7', ageMin: 5, ageMax: 6 },
  { code: 'U9', ageMin: 7, ageMax: 8 },
  { code: 'U11', ageMin: 9, ageMax: 10 },
  { code: 'U13', ageMin: 11, ageMax: 12 },
  { code: 'U15', ageMin: 13, ageMax: 14 },
  { code: 'U17', ageMin: 15, ageMax: 16 },
] as const;

export const AGE_MIN = CATEGORIES[0].ageMin;
export const AGE_MAX = CATEGORIES[CATEGORIES.length - 1].ageMax;

/** Âge en années révolues à la date donnée (naissance au format AAAA-MM-JJ). */
export function calculerAge(naissance: string, aujourdhui: Date = new Date()): number | null {
  const morceaux = /^(\d{4})-(\d{2})-(\d{2})$/.exec(naissance);
  if (!morceaux) {
    return null;
  }
  const annee = Number(morceaux[1]);
  const mois = Number(morceaux[2]);
  const jour = Number(morceaux[3]);

  let age = aujourdhui.getUTCFullYear() - annee;
  const moisCourant = aujourdhui.getUTCMonth() + 1;
  if (moisCourant < mois || (moisCourant === mois && aujourdhui.getUTCDate() < jour)) {
    age--;
  }
  return age;
}

/** Catégorie correspondant à l'âge, ou null si l'âge est hors du club. */
export function categoriePourAge(age: number | null): string | null {
  if (age === null) {
    return null;
  }
  return CATEGORIES.find((c) => age >= c.ageMin && age <= c.ageMax)?.code ?? null;
}
