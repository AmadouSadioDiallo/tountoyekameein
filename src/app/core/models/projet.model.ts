export type StatutProjet = 'Actif' | 'Terminé' | 'Annulé';

export const STATUTS_PROJET: readonly StatutProjet[] = [
  'Actif',
  'Terminé',
  'Annulé',
] as const;

export interface Projet {
  id: string;
  nom: string;
  description?: string;
  coutEstime: number;
  statut: StatutProjet;
  archive: boolean;
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