import { TestBed } from '@angular/core/testing';
import { ProjetsRepository } from './projets.repository';
import { SheetsApiService } from './sheets-api.service';
import { PROJET_COLUMNS } from '../models';

const mockApi = {
  readAll: jest.fn(),
  append: jest.fn(),
  updateRow: jest.fn(),
};

function makeProjetRow(overrides: Partial<Record<string, unknown>> = {}): unknown[] {
  const defaults: Record<string, unknown> = {
    id: 'PROJ-0001',
    nom: 'Construction mosquée',
    description: 'Projet de construction',
    coutEstime: '5000000',
    statut: 'Actif',
    archive: 'FALSE',
    dateCreation: '2025-01-01T00:00:00.000Z',
    dateModif: '2025-01-01T00:00:00.000Z',
    supprime: 'FALSE',
  };
  const merged = { ...defaults, ...overrides };
  return PROJET_COLUMNS.map((col) => merged[col] ?? '');
}

describe('ProjetsRepository', () => {
  let repo: ProjetsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProjetsRepository,
        { provide: SheetsApiService, useValue: mockApi },
      ],
    });
    repo = TestBed.inject(ProjetsRepository);
  });

  describe('findAll', () => {
    it('should exclude archived and deleted by default', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', archive: 'FALSE', supprime: 'FALSE' }),
        makeProjetRow({ id: 'PROJ-0002', archive: 'TRUE', supprime: 'FALSE' }),
        makeProjetRow({ id: 'PROJ-0003', archive: 'FALSE', supprime: 'TRUE' }),
      ]);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('PROJ-0001');
    });

    it('should include archived when requested', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', archive: 'FALSE' }),
        makeProjetRow({ id: 'PROJ-0002', archive: 'TRUE' }),
      ]);

      const result = await repo.findAll(true);

      expect(result).toHaveLength(2);
    });

    it('should parse coutEstime as number', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ coutEstime: '3000000' }),
      ]);

      const result = await repo.findAll();

      expect(result[0].coutEstime).toBe(3000000);
    });
  });

  describe('findById', () => {
    it('should return the project even if archived or deleted', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', archive: 'TRUE', supprime: 'TRUE' }),
      ]);

      const result = await repo.findById('PROJ-0001');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('PROJ-0001');
    });

    it('should return null when not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      const result = await repo.findById('PROJ-9999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a project with generated ID', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0005' }),
      ]);
      mockApi.append.mockResolvedValue(undefined);

      const data = {
        nom: 'Nouveau projet',
        description: 'Description',
        coutEstime: 2000000,
        statut: 'Actif' as const,
      };

      const result = await repo.create(data);

      expect(result.id).toBe('PROJ-0006');
      expect(result.archive).toBe(false);
      expect(result.supprime).toBe(false);
      expect(result.dateCreation).toBeTruthy();
      expect(mockApi.append).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update project and preserve system fields', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', dateCreation: '2024-01-01T00:00:00.000Z', archive: 'TRUE' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const result = await repo.update('PROJ-0001', {
        nom: 'Updated',
        description: '',
        coutEstime: 1000000,
        statut: 'Terminé',
      } as any);

      expect(result.nom).toBe('Updated');
      expect(result.dateCreation).toBe('2024-01-01T00:00:00.000Z');
      expect(result.archive).toBe(true);
      expect(result.supprime).toBe(false);
    });

    it('should throw when project not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.update('PROJ-9999', {} as any)).rejects.toThrow('Projet PROJ-9999 introuvable');
    });
  });

  describe('setArchive', () => {
    it('should set archive flag to true', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', archive: 'FALSE' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const result = await repo.setArchive('PROJ-0001', true);

      expect(result.archive).toBe(true);
    });

    it('should set archive flag to false', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001', archive: 'TRUE' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const result = await repo.setArchive('PROJ-0001', false);

      expect(result.archive).toBe(false);
    });

    it('should throw when project not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.setArchive('PROJ-9999', true)).rejects.toThrow('Projet PROJ-9999 introuvable');
    });
  });

  describe('softDelete', () => {
    it('should mark project as deleted', async () => {
      mockApi.readAll.mockResolvedValue([
        makeProjetRow({ id: 'PROJ-0001' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      await repo.softDelete('PROJ-0001');

      const rowArg = mockApi.updateRow.mock.calls[0][2];
      const supprimeIndex = PROJET_COLUMNS.indexOf('supprime');
      expect(rowArg[supprimeIndex]).toBe('TRUE');
    });

    it('should throw when project not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.softDelete('PROJ-9999')).rejects.toThrow('Projet PROJ-9999 introuvable');
    });
  });
});
