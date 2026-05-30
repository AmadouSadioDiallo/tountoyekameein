import { TestBed } from '@angular/core/testing';
import { PersonsRepository } from './persons.repository';
import { SheetsApiService } from './sheets-api.service';
import { PERSON_COLUMNS } from '../models';

const mockApi = {
  readAll: jest.fn(),
  append: jest.fn(),
  updateRow: jest.fn(),
};

function makePersonRow(overrides: Partial<Record<string, unknown>> = {}): unknown[] {
  const defaults: Record<string, unknown> = {
    id: 'PERS-0001',
    civilite: 'M.',
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'mamadou@test.com',
    telephone: '621000000',
    dateNaissance: '1990-01-01',
    villeNaissance: 'Conakry',
    paysNaissance: 'Guinée',
    nomPere: 'Ibrahima',
    nomMere: 'Fatoumata',
    adresse: '10 rue Test',
    ville: 'Conakry',
    pays: 'Guinée',
    statut: 'Actif',
    notes: '',
    dateCreation: '2025-01-01T00:00:00.000Z',
    dateModif: '2025-01-01T00:00:00.000Z',
    supprime: 'FALSE',
  };
  const merged = { ...defaults, ...overrides };
  return PERSON_COLUMNS.map((col) => merged[col] ?? '');
}

describe('PersonsRepository', () => {
  let repo: PersonsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PersonsRepository,
        { provide: SheetsApiService, useValue: mockApi },
      ],
    });
    repo = TestBed.inject(PersonsRepository);
  });

  describe('findAll', () => {
    it('should return non-deleted persons by default', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', supprime: 'FALSE' }),
        makePersonRow({ id: 'PERS-0002', supprime: 'TRUE' }),
      ]);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('PERS-0001');
      expect(result[0].supprime).toBe(false);
    });

    it('should return all persons when includeDeleted is true', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', supprime: 'FALSE' }),
        makePersonRow({ id: 'PERS-0002', supprime: 'TRUE' }),
      ]);

      const result = await repo.findAll(true);

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no data', async () => {
      mockApi.readAll.mockResolvedValue([]);

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });

    it('should map row data correctly to Person objects', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ nom: 'Barry', prenom: 'Alpha', statut: 'Inactif' }),
      ]);

      const result = await repo.findAll();

      expect(result[0].nom).toBe('Barry');
      expect(result[0].prenom).toBe('Alpha');
      expect(result[0].statut).toBe('Inactif');
    });
  });

  describe('findById', () => {
    it('should return the matching person', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001' }),
        makePersonRow({ id: 'PERS-0002', nom: 'Bah' }),
      ]);

      const result = await repo.findById('PERS-0002');

      expect(result).not.toBeNull();
      expect(result!.nom).toBe('Bah');
    });

    it('should return null when person not found', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001' }),
      ]);

      const result = await repo.findById('PERS-9999');

      expect(result).toBeNull();
    });
  });

  describe('existsByEmail', () => {
    beforeEach(() => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', email: 'existing@test.com', supprime: 'FALSE' }),
        makePersonRow({ id: 'PERS-0002', email: 'deleted@test.com', supprime: 'TRUE' }),
      ]);
    });

    it('should return true when email exists', async () => {
      expect(await repo.existsByEmail('existing@test.com')).toBe(true);
    });

    it('should be case-insensitive', async () => {
      expect(await repo.existsByEmail('EXISTING@TEST.COM')).toBe(true);
    });

    it('should return false for non-existing email', async () => {
      expect(await repo.existsByEmail('new@test.com')).toBe(false);
    });

    it('should ignore deleted persons', async () => {
      expect(await repo.existsByEmail('deleted@test.com')).toBe(false);
    });

    it('should exclude a specific ID (for update scenarios)', async () => {
      expect(await repo.existsByEmail('existing@test.com', 'PERS-0001')).toBe(false);
    });
  });

  describe('create', () => {
    it('should append a new person and return it with generated ID', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0003' }),
      ]);
      mockApi.append.mockResolvedValue(undefined);

      const data = {
        civilite: 'Mme' as const,
        nom: 'Sow',
        prenom: 'Aissatou',
        email: 'aissatou@test.com',
        telephone: '',
        dateNaissance: '',
        villeNaissance: 'Labé',
        paysNaissance: 'Guinée',
        nomPere: '',
        nomMere: '',
        adresse: '5 rue Labé',
        ville: 'Labé',
        pays: 'Guinée',
        statut: 'Actif' as const,
        notes: '',
      };

      const result = await repo.create(data);

      expect(result.id).toBe('PERS-0004');
      expect(result.nom).toBe('Sow');
      expect(result.supprime).toBe(false);
      expect(result.dateCreation).toBeTruthy();
      expect(mockApi.append).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update person and return the updated data', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', nom: 'Diallo' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const data = {
        civilite: 'M.' as const,
        nom: 'Diallo-Updated',
        prenom: 'Mamadou',
        email: 'mamadou@test.com',
        telephone: '',
        dateNaissance: '',
        villeNaissance: 'Conakry',
        paysNaissance: 'Guinée',
        nomPere: '',
        nomMere: '',
        adresse: '10 rue Test',
        ville: 'Conakry',
        pays: 'Guinée',
        statut: 'Actif' as const,
        notes: '',
      };

      const result = await repo.update('PERS-0001', data);

      expect(result.nom).toBe('Diallo-Updated');
      expect(result.id).toBe('PERS-0001');
      expect(mockApi.updateRow).toHaveBeenCalledWith(expect.anything(), 0, expect.any(Array));
    });

    it('should throw when person not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.update('PERS-9999', {} as any)).rejects.toThrow('Person PERS-9999 not found');
    });

    it('should preserve dateCreation and supprime fields', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', dateCreation: '2024-01-01T00:00:00.000Z', supprime: 'FALSE' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const result = await repo.update('PERS-0001', {
        civilite: 'M.',
        nom: 'Test',
        prenom: 'Test',
        email: 'test@test.com',
        villeNaissance: '',
        paysNaissance: '',
        adresse: '',
        ville: '',
        pays: '',
        statut: 'Actif',
      } as any);

      expect(result.dateCreation).toBe('2024-01-01T00:00:00.000Z');
      expect(result.supprime).toBe(false);
    });
  });

  describe('softDelete', () => {
    it('should mark person as supprime', async () => {
      mockApi.readAll.mockResolvedValue([
        makePersonRow({ id: 'PERS-0001', supprime: 'FALSE' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      await repo.softDelete('PERS-0001');

      expect(mockApi.updateRow).toHaveBeenCalledTimes(1);
      const rowArg = mockApi.updateRow.mock.calls[0][2];
      const supprimeIndex = PERSON_COLUMNS.indexOf('supprime');
      expect(rowArg[supprimeIndex]).toBe('TRUE');
    });

    it('should throw when person not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.softDelete('PERS-9999')).rejects.toThrow('Person PERS-9999 not found');
    });
  });
});
