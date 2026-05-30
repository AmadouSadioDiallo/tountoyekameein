import { TestBed } from '@angular/core/testing';
import { CotisationsFacade } from './cotisations.facade';
import { CotisationsRepository } from './cotisations.repository';
import { AuditService } from './audit.service';
import { Cotisation } from '../models';

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByPersonId: jest.fn(),
  findByProjetId: jest.fn(),
  getTotalsByPerson: jest.fn(),
  getTotalsByProjet: jest.fn(),
  getStatsByPersonForProjet: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockAudit = {
  log: jest.fn().mockResolvedValue(undefined),
};

const COT_STUB: Cotisation = {
  id: 'COT-0001',
  personId: 'PERS-0001',
  projetId: 'PROJ-0001',
  montant: 50000,
  date: '2025-03-01',
  modePaiement: 'Espèces',
  periode: 'Mars 2025',
  notes: '',
  supprime: false,
};

describe('CotisationsFacade', () => {
  let facade: CotisationsFacade;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CotisationsFacade,
        { provide: CotisationsRepository, useValue: mockRepo },
        { provide: AuditService, useValue: mockAudit },
      ],
    });
    facade = TestBed.inject(CotisationsFacade);
  });

  describe('delegated methods', () => {
    it('findAll should delegate to repository', async () => {
      mockRepo.findAll.mockResolvedValue([COT_STUB]);
      expect(await facade.findAll()).toEqual([COT_STUB]);
    });

    it('findById should delegate to repository', async () => {
      mockRepo.findById.mockResolvedValue(COT_STUB);
      expect(await facade.findById('COT-0001')).toEqual(COT_STUB);
    });

    it('findByPersonId should delegate to repository', async () => {
      mockRepo.findByPersonId.mockResolvedValue([COT_STUB]);
      expect(await facade.findByPersonId('PERS-0001')).toEqual([COT_STUB]);
    });

    it('findByProjetId should delegate to repository', async () => {
      mockRepo.findByProjetId.mockResolvedValue([COT_STUB]);
      expect(await facade.findByProjetId('PROJ-0001')).toEqual([COT_STUB]);
    });

    it('getTotalsByPerson should delegate to repository', async () => {
      const totals = new Map([['PERS-0001', 50000]]);
      mockRepo.getTotalsByPerson.mockResolvedValue(totals);
      expect(await facade.getTotalsByPerson()).toEqual(totals);
    });

    it('getTotalsByProjet should delegate to repository', async () => {
      const totals = new Map([['PROJ-0001', 50000]]);
      mockRepo.getTotalsByProjet.mockResolvedValue(totals);
      expect(await facade.getTotalsByProjet()).toEqual(totals);
    });

    it('getStatsByPersonForProjet should delegate to repository', async () => {
      const stats = new Map([['PERS-0001', { total: 50000, count: 1 }]]);
      mockRepo.getStatsByPersonForProjet.mockResolvedValue(stats);
      expect(await facade.getStatsByPersonForProjet('PROJ-0001')).toEqual(stats);
    });
  });

  describe('create', () => {
    it('should create cotisation and log audit', async () => {
      const formData = {
        personId: 'PERS-0001',
        projetId: 'PROJ-0001',
        montant: 100000,
        date: '2025-06-01',
        modePaiement: 'Virement' as const,
        periode: 'Juin 2025',
        notes: '',
      };
      const created = { ...COT_STUB, ...formData, id: 'COT-0002' };
      mockRepo.create.mockResolvedValue(created);

      const result = await facade.create(formData);

      expect(result.id).toBe('COT-0002');
      expect(mockAudit.log).toHaveBeenCalledWith('CREATE', 'Cotisation', 'COT-0002', { after: created });
    });
  });

  describe('update', () => {
    it('should update cotisation and log audit with before/after', async () => {
      const updated = { ...COT_STUB, montant: 75000 };
      mockRepo.findById.mockResolvedValue(COT_STUB);
      mockRepo.update.mockResolvedValue(updated);

      const result = await facade.update('COT-0001', {
        personId: 'PERS-0001',
        projetId: 'PROJ-0001',
        montant: 75000,
        date: '2025-03-01',
        modePaiement: 'Chèque',
        periode: 'Mars 2025',
        notes: '',
      } as any);

      expect(result.montant).toBe(75000);
      expect(mockAudit.log).toHaveBeenCalledWith('UPDATE', 'Cotisation', 'COT-0001', {
        before: COT_STUB,
        after: updated,
      });
    });
  });

  describe('delete', () => {
    it('should soft delete and log audit', async () => {
      mockRepo.findById.mockResolvedValue(COT_STUB);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await facade.delete('COT-0001');

      expect(mockRepo.softDelete).toHaveBeenCalledWith('COT-0001');
      expect(mockAudit.log).toHaveBeenCalledWith('DELETE', 'Cotisation', 'COT-0001', { before: COT_STUB });
    });
  });
});
