export type Role = 'ADMIN' | 'STANDARD';

/** Utilisateur applicatif (depuis la feuille Users). */
export interface AppUser {
  email: string;
  role: Role;
  actif: boolean;
}

/** Utilisateur connecté (Google + rôle applicatif résolu). */
export interface CurrentUser {
  email: string;
  name: string;
  picture: string;
  role: Role;
}

export const USER_COLUMNS = ['email', 'role', 'actif'] as const;
export type UserColumn = (typeof USER_COLUMNS)[number];
