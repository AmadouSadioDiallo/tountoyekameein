/** Compte rendu de réunion. */
export interface CompteRendu {
  id: string;              // CR-0001
  nomReunion: string;
  date: string;            // ISO YYYY-MM-DD
  lieu?: string;
  redacteur: string;
  contenu: string;         // max 2000 caractères
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
  'contenu',
  'dateCreation',
  'dateModif',
  'supprime',
] as const;

export type CompteRenduColumn = (typeof COMPTE_RENDU_COLUMNS)[number];

/** Limite de caractères pour le contenu. */
export const CONTENU_MAX_LENGTH = 5000;
