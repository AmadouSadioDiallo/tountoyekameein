export type ModePaiement = 'Espèces' | 'Chèque' | 'Virement' | 'Carte';

export const MODES_PAIEMENT: readonly ModePaiement[] = [
  'Espèces',
  'Chèque',
  'Virement',
  'Carte',
] as const;

export interface Cotisation {
  id: string;             // COT-0001
  personId: string;       // référence Person
  projetId: string;       // référence Projet
  montant: number;
  date: string;           // ISO YYYY-MM-DD
  modePaiement: ModePaiement;
  periode: string;        // ex: "2026", "2026/2027"
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
