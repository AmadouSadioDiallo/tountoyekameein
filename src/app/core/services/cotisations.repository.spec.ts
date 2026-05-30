import { TestBed } from '@angular/core/testing';
import { CotisationsRepository } from './cotisations.repository';
import { SheetsApiService } from './sheets-api.service';
import { COTISATION_COLUMNS } from '../models';

const mockApi = {
  readAll: jest.fn(),
  append: jest.fn(),
  updateRow: jest.fn(),
};

function makeCotisationRow(overrides: Partial<Record<string, unknown>> = {}): unknown[] {
  const defaults: Record<string, unknown> = {
    id: 'COT-0001',
    personId: 'PERS-0001',
    projetId: 'PROJ-0001',
    montant: '50000',
    date: '2025-03-01',
    modePaiement: 'Espèces',
    periode: 'Mars 2025',
    notes: '',
    supprime: 'FALSE',
  };
  const merged = { ...defaults, ...overrides };
  return COTISATION_COLUMNS.map((col) => merged[col] ?? '');
}

describe('CotisationsRepository', () => {
  let repo: CotisationsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CotisationsRepository,
        { provide: SheetsApiService, useValue: mockApi },
      ],
    });
    repo = TestBed.inject(CotisationsRepository);
  });

  describe('findAll', () => {
    it('should return non-deleted cotisations by default', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0001', supprime: 'FALSE' }),
        makeCotisationRow({ id: 'COT-0002', supprime: 'TRUE' }),
      ]);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('COT-0001');
    });

    it('should parse montant as number', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ montant: '75000' }),
      ]);

      const result = await repo.findAll();

      expect(result[0].montant).toBe(75000);
      expect(typeof result[0].montant).toBe('number');
    });
  });

  describe('findByPersonId', () => {
    it('should return cotisations for a specific person', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0001', personId: 'PERS-0001' }),
        makeCotisationRow({ id: 'COT-0002', personId: 'PERS-0002' }),
        makeCotisationRow({ id: 'COT-0003', personId: 'PERS-0001' }),
      ]);

      const result = await repo.findByPersonId('PERS-0001');

      expect(result).toHaveLength(2);
      expect(result.every((c) => c.personId === 'PERS-0001')).toBe(true);
    });
  });

  describe('findByProjetId', () => {
    it('should return cotisations for a specific project', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0001', projetId: 'PROJ-0001' }),
        makeCotisationRow({ id: 'COT-0002', projetId: 'PROJ-0002' }),
      ]);

      const result = await repo.findByProjetId('PROJ-0001');

      expect(result).toHaveLength(1);
      expect(result[0].projetId).toBe('PROJ-0001');
    });
  });

  describe('create', () => {
    it('should create a cotisation with generated ID', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0002' }),
      ]);
      mockApi.append.mockResolvedValue(undefined);

      const data = {
        personId: 'PERS-0001',
        projetId: 'PROJ-0001',
        montant: 100000,
        date: '2025-06-01',
        modePaiement: 'Virement' as const,
        periode: 'Juin 2025',
        notes: '',
      };

      const result = await repo.create(data);

      expect(result.id).toBe('COT-0003');
      expect(result.montant).toBe(100000);
      expect(result.supprime).toBe(false);
      expect(mockApi.append).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update and return the cotisation', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0001', montant: '50000' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      const result = await repo.update('COT-0001', {
        personId: 'PERS-0001',
        projetId: 'PROJ-0001',
        montant: 75000,
        date: '2025-03-01',
        modePaiement: 'Chèque',
        periode: 'Mars 2025',
        notes: 'updated',
      } as any);

      expect(result.montant).toBe(75000);
      expect(result.id).toBe('COT-0001');
      expect(mockApi.updateRow).toHaveBeenCalledTimes(1);
    });

    it('should throw when cotisation not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.update('COT-9999', {} as any)).rejects.toThrow('Cotisation COT-9999 introuvable');
    });
  });

  describe('softDelete', () => {
    it('should mark cotisation as deleted', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ id: 'COT-0001' }),
      ]);
      mockApi.updateRow.mockResolvedValue(undefined);

      await repo.softDelete('COT-0001');

      const rowArg = mockApi.updateRow.mock.calls[0][2];
      const supprimeIndex = COTISATION_COLUMNS.indexOf('supprime');
      expect(rowArg[supprimeIndex]).toBe('TRUE');
    });

    it('should throw when cotisation not found', async () => {
      mockApi.readAll.mockResolvedValue([]);

      await expect(repo.softDelete('COT-9999')).rejects.toThrow('Cotisation COT-9999 introuvable');
    });
  });

  describe('getTotalsByPerson', () => {
    it('should aggregate totals per person', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ personId: 'PERS-0001', montant: '50000' }),
        makeCotisationRow({ personId: 'PERS-0001', montant: '30000' }),
        makeCotisationRow({ personId: 'PERS-0002', montant: '100000' }),
      ]);

      const totals = await repo.getTotalsByPerson();

      expect(totals.get('PERS-0001')).toBe(80000);
      expect(totals.get('PERS-0002')).toBe(100000);
    });
  });

  describe('getTotalsByProjet', () => {
    it('should aggregate totals per project', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ projetId: 'PROJ-0001', montant: '50000' }),
        makeCotisationRow({ projetId: 'PROJ-0001', montant: '25000' }),
        makeCotisationRow({ projetId: 'PROJ-0002', montant: '100000' }),
      ]);

      const totals = await repo.getTotalsByProjet();

      expect(totals.get('PROJ-0001')).toBe(75000);
      expect(totals.get('PROJ-0002')).toBe(100000);
    });
  });

  describe('getStatsByPersonForProjet', () => {
    it('should return total and count per person for a project', async () => {
      mockApi.readAll.mockResolvedValue([
        makeCotisationRow({ personId: 'PERS-0001', projetId: 'PROJ-0001', montant: '50000' }),
        makeCotisationRow({ personId: 'PERS-0001', projetId: 'PROJ-0001', montant: '30000' }),
        makeCotisationRow({ personId: 'PERS-0002', projetId: 'PROJ-0001', montant: '100000' }),
        makeCotisationRow({ personId: 'PERS-0001', projetId: 'PROJ-0002', montant: '200000' }),
      ]);

      const stats = await repo.getStatsByPersonForProjet('PROJ-0001');

      expect(stats.get('PERS-0001')).toEqual({ total: 80000, count: 2 });
      expect(stats.get('PERS-0002')).toEqual({ total: 100000, count: 1 });
      expect(stats.has('PERS-0003')).toBe(false);
    });
  });
});
