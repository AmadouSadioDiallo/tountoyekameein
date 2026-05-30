import { TestBed } from '@angular/core/testing';
import { AuditService } from './audit.service';
import { SheetsApiService } from './sheets-api.service';
import { CurrentUserService } from './current-user.service';
import { AUDIT_COLUMNS } from '../models';
import { signal } from '@angular/core';

const mockApi = {
  readAll: jest.fn(),
  append: jest.fn().mockResolvedValue(undefined),
};

const mockUser = signal<{ email: string } | null>({ email: 'admin@test.com' });

const mockCurrentUser = {
  user: mockUser,
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser.set({ email: 'admin@test.com' });
    TestBed.configureTestingModule({
      providers: [
        AuditService,
        { provide: SheetsApiService, useValue: mockApi },
        { provide: CurrentUserService, useValue: mockCurrentUser },
      ],
    });
    service = TestBed.inject(AuditService);
  });

  describe('log', () => {
    it('should append an audit entry with current user email', async () => {
      await service.log('CREATE', 'Person', 'PERS-0001', { after: { nom: 'Test' } });

      expect(mockApi.append).toHaveBeenCalledTimes(1);
      const row = mockApi.append.mock.calls[0][1];
      const emailIndex = AUDIT_COLUMNS.indexOf('userEmail');
      const actionIndex = AUDIT_COLUMNS.indexOf('action');
      const entityIndex = AUDIT_COLUMNS.indexOf('entity');
      expect(row[emailIndex]).toBe('admin@test.com');
      expect(row[actionIndex]).toBe('CREATE');
      expect(row[entityIndex]).toBe('Person');
    });

    it('should use "unknown" when no user is logged in', async () => {
      mockUser.set(null);

      await service.log('DELETE', 'Cotisation', 'COT-0001');

      const row = mockApi.append.mock.calls[0][1];
      const emailIndex = AUDIT_COLUMNS.indexOf('userEmail');
      expect(row[emailIndex]).toBe('unknown');
    });

    it('should serialize details as JSON', async () => {
      const details = { before: { nom: 'Old' }, after: { nom: 'New' } };

      await service.log('UPDATE', 'Person', 'PERS-0001', details);

      const row = mockApi.append.mock.calls[0][1];
      const detailsIndex = AUDIT_COLUMNS.indexOf('details');
      expect(JSON.parse(row[detailsIndex] as string)).toEqual(details);
    });
  });

  describe('findAll', () => {
    it('should return entries sorted by timestamp descending', async () => {
      mockApi.readAll.mockResolvedValue([
        ['2025-01-01T00:00:00.000Z', 'a@test.com', 'CREATE', 'Person', 'PERS-0001', '{}'],
        ['2025-06-01T00:00:00.000Z', 'b@test.com', 'UPDATE', 'Projet', 'PROJ-0001', '{}'],
        ['2025-03-01T00:00:00.000Z', 'a@test.com', 'DELETE', 'Cotisation', 'COT-0001', '{}'],
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toBe('2025-06-01T00:00:00.000Z');
      expect(result[1].timestamp).toBe('2025-03-01T00:00:00.000Z');
      expect(result[2].timestamp).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should return empty array when no entries', async () => {
      mockApi.readAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
