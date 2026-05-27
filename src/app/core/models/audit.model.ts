export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'UNARCHIVE';
export type AuditEntity = 'Person' | 'Cotisation' | 'Projet' | 'CompteRendu';

export interface AuditEntry {
  timestamp: string;
  userEmail: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  details: string;
}

export const AUDIT_COLUMNS = [
  'timestamp',
  'userEmail',
  'action',
  'entity',
  'entityId',
  'details',
] as const;