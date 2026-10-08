import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'inscription' })
@Unique('uk_inscription_enfant', ['prenom', 'nom', 'dateNaissance', 'emailParent'])
export class Inscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  /** Format AAAA-MM-JJ (le type « date » de PostgreSQL est lu comme une chaîne). */
  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: string;

  @Column({ type: 'varchar', length: 10 })
  categorie: string;

  @Column({ name: 'email_parent', type: 'varchar', length: 254 })
  emailParent: string;

  @Column({ name: 'telephone_parent', type: 'varchar', length: 20 })
  telephoneParent: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
