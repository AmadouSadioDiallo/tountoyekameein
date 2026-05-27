export type Role = 'ADMIN' | 'MEMBER';

export interface AppUser {
  email: string;
  role: Role;
  actif: boolean;
}

export interface CurrentUser {
  email: string;
  name: string;
  picture: string;
  role: Role;
}

export const USER_COLUMNS = ['email', 'role', 'actif'] as const;