export type StatutProjet = 'Actif' | 'Terminé' | 'Annulé';

export const STATUTS_PROJET: readonly StatutProjet[] = [
  'Actif',
  'Terminé',
  'Annulé',
] as const;

/** Représente un projet/cause pour lequel on collecte des cotisations. */
export interface Projet {
  id: string;                 // PROJ-0001
  nom: string;
  description?: string;
  coutEstime: number;          // anciennement montantEstime
  statut: StatutProjet;
  archive: boolean;            // nouveau : visibilité dans les listes
  dateCreation: string;
  dateModif: string;
  supprime: boolean;
}

export type ProjetFormData = Omit<
  Projet,
  'id' | 'archive' | 'dateCreation' | 'dateModif' | 'supprime'
>;

export const PROJET_COLUMNS = [
  'id',
  'nom',
  'description',
  'coutEstime',
  'statut',
  'archive',
  'dateCreation',
  'dateModif',
  'supprime',
] as const;

export type ProjetColumn = (typeof PROJET_COLUMNS)[number];
