export interface CompteRendu {
  id: string;
  nomReunion: string;
  date: string;
  lieu?: string;
  redacteur: string;
  projetId?: string;
  contenu: string;
  dateCreation: string;
  dateModif: string;
  supprime: boolean;
}

export type CompteRenduFormData = Omit<
  CompteRendu,
  'id' | 'dateCreation' | 'dateModif' | 'supprime'
>;

export const COMPTE_RENDU_COLUMNS = [
  'id',
  'nomReunion',
  'date',
  'lieu',
  'redacteur',
  'projetId',
  'contenu',
  'dateCreation',
  'dateModif',
  'supprime',
] as const;

export type CompteRenduColumn = (typeof COMPTE_RENDU_COLUMNS)[number];

export const CONTENU_MAX_LENGTH = 5000;
