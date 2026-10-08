import { calculerAge, categoriePourAge } from './categories';

// 8 octobre 2026
const AUJOURDHUI = new Date(Date.UTC(2026, 9, 8));

describe('calculerAge', () => {
  it("compte l'âge en années révolues", () => {
    expect(calculerAge('2016-05-12', AUJOURDHUI)).toBe(10);
  });

  it("retire un an quand l'anniversaire n'est pas encore passé", () => {
    expect(calculerAge('2016-12-01', AUJOURDHUI)).toBe(9);
  });

  it("compte l'anniversaire le jour même", () => {
    expect(calculerAge('2016-10-08', AUJOURDHUI)).toBe(10);
  });

  it('renvoie null si le format est invalide', () => {
    expect(calculerAge('08/10/2016', AUJOURDHUI)).toBeNull();
  });
});

describe('categoriePourAge', () => {
  it.each([
    [5, 'U7'],
    [6, 'U7'],
    [7, 'U9'],
    [10, 'U11'],
    [12, 'U13'],
    [14, 'U15'],
    [16, 'U17'],
  ])('un enfant de %i ans est en %s', (age, categorie) => {
    expect(categoriePourAge(age)).toBe(categorie);
  });

  it.each([[4], [17], [-1], [40]])("refuse l'âge %i", (age) => {
    expect(categoriePourAge(age)).toBeNull();
  });

  it('refuse un âge inconnu', () => {
    expect(categoriePourAge(null)).toBeNull();
  });
});
