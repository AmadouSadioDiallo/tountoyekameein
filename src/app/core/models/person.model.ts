export type Civilite = 'M.' | 'Mme' | 'Mlle';
export type Statut = 'Actif' | 'Inactif' | 'En attente';

export const CIVILITES: readonly Civilite[] = ['M.', 'Mme', 'Mlle'] as const;
export const STATUTS: readonly Statut[] = ['Actif', 'Inactif', 'En attente'] as const;

export interface Person {
  id: string;
  civilite: Civilite;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  villeNaissance: string;
  paysNaissance: string;
  nomPere?: string;
  nomMere?: string;
  adresse: string;
  ville: string;
  pays: string;
  statut: Statut;
  notes?: string;
  dateCreation: string;
  dateModif: string;
  supprime: boolean;
}

export type PersonFormData = Omit<
  Person,
  'id' | 'dateCreation' | 'dateModif' | 'supprime'
>;

export const PERSON_COLUMNS = [
  'id',
  'civilite',
  'nom',
  'prenom',
  'email',
  'telephone',
  'dateNaissance',
  'villeNaissance',
  'paysNaissance',
  'nomPere',
  'nomMere',
  'adresse',
  'ville',
  'pays',
  'statut',
  'notes',
  'dateCreation',
  'dateModif',
  'supprime',
] as const;