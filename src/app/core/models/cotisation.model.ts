export type ModePaiement = 'Espèces' | 'Chèque' | 'Virement' | 'Carte';

export const MODES_PAIEMENT: readonly ModePaiement[] = [
  'Espèces',
  'Chèque',
  'Virement',
  'Carte',
] as const;

export interface Cotisation {
  id: string;
  personId: string;
  projetId: string;
  montant: number;
  date: string;
  modePaiement: ModePaiement;
  periode: string;
  notes?: string;
  supprime: boolean;
}

export type CotisationFormData = Omit<Cotisation, 'id' | 'supprime'>;

export const COTISATION_COLUMNS = [
  'id',
  'personId',
  'projetId',
  'montant',
  'date',
  'modePaiement',
  'periode',
  'notes',
  'supprime',
] as const;

export type CotisationColumn = (typeof COTISATION_COLUMNS)[number];
