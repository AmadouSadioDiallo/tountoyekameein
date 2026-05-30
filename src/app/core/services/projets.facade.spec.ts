import { TestBed } from '@angular/core/testing';
import { ProjetsFacade } from './projets.facade';
import { ProjetsRepository } from './projets.repository';
import { AuditService } from './audit.service';
import { Projet } from '../models';

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  setArchive: jest.fn(),
  softDelete: jest.fn(),
};

const mockAudit = {
  log: jest.fn().mockResolvedValue(undefined),
};

const PROJET_STUB: Projet = {
  id: 'PROJ-0001',
  nom: 'Construction mosquée',
  description: 'Projet de construction',
  coutEstime: 5000000,
  statut: 'Actif',
  archive: false,
  dateCreation: '2025-01-01T00:00:00.000Z',
  dateModif: '2025-01-01T00:00:00.000Z',
  supprime: false,
};

describe('ProjetsFacade', () => {
  let facade: ProjetsFacade;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProjetsFacade,
        { provide: ProjetsRepository, useValue: mockRepo },
        { provide: AuditService, useValue: mockAudit },
      ],
    });
    facade = TestBed.inject(ProjetsFacade);
  });

  describe('findAll', () => {
    it('should delegate to repository with includeArchived flag', async () => {
      mockRepo.findAll.mockResolvedValue([PROJET_STUB]);

      await facade.findAll(true);

      expect(mockRepo.findAll).toHaveBeenCalledWith(true);
    });

    it('should default includeArchived to false', async () => {
      mockRepo.findAll.mockResolvedValue([]);

      await facade.findAll();

      expect(mockRepo.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('create', () => {
    it('should create project and log audit', async () => {
      const formData = {
        nom: 'Nouveau projet',
        description: '',
        coutEstime: 2000000,
        statut: 'Actif' as const,
      };
      const created = { ...PROJET_STUB, ...formData, id: 'PROJ-0002' };
      mockRepo.create.mockResolvedValue(created);

      const result = await facade.create(formData);

      expect(result.id).toBe('PROJ-0002');
      expect(mockAudit.log).toHaveBeenCalledWith('CREATE', 'Projet', 'PROJ-0002', { after: created });
    });
  });

  describe('update', () => {
    it('should update project and log audit', async () => {
      const updated = { ...PROJET_STUB, nom: 'Updated' };
      mockRepo.findById.mockResolvedValue(PROJET_STUB);
      mockRepo.update.mockResolvedValue(updated);

      const result = await facade.update('PROJ-0001', {
        nom: 'Updated',
        description: '',
        coutEstime: 5000000,
        statut: 'Actif',
      } as any);

      expect(result.nom).toBe('Updated');
      expect(mockAudit.log).toHaveBeenCalledWith('UPDATE', 'Projet', 'PROJ-0001', {
        before: PROJET_STUB,
        after: updated,
      });
    });

    it('should throw when project not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(facade.update('PROJ-9999', {} as any)).rejects.toThrow('Projet PROJ-9999 introuvable');
    });
  });

  describe('archive', () => {
    it('should archive project and log audit', async () => {
      const archived = { ...PROJET_STUB, archive: true };
      mockRepo.setArchive.mockResolvedValue(archived);

      const result = await facade.archive('PROJ-0001');

      expect(result.archive).toBe(true);
      expect(mockRepo.setArchive).toHaveBeenCalledWith('PROJ-0001', true);
      expect(mockAudit.log).toHaveBeenCalledWith('ARCHIVE', 'Projet', 'PROJ-0001', { projet: archived });
    });
  });

  describe('unarchive', () => {
    it('should unarchive project and log audit', async () => {
      const unarchived = { ...PROJET_STUB, archive: false };
      mockRepo.setArchive.mockResolvedValue(unarchived);

      const result = await facade.unarchive('PROJ-0001');

      expect(result.archive).toBe(false);
      expect(mockRepo.setArchive).toHaveBeenCalledWith('PROJ-0001', false);
      expect(mockAudit.log).toHaveBeenCalledWith('UNARCHIVE', 'Projet', 'PROJ-0001', { projet: unarchived });
    });
  });

  describe('delete', () => {
    it('should soft delete and log audit', async () => {
      mockRepo.findById.mockResolvedValue(PROJET_STUB);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await facade.delete('PROJ-0001');

      expect(mockRepo.softDelete).toHaveBeenCalledWith('PROJ-0001');
      expect(mockAudit.log).toHaveBeenCalledWith('DELETE', 'Projet', 'PROJ-0001', { before: PROJET_STUB });
    });

    it('should throw when project not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(facade.delete('PROJ-9999')).rejects.toThrow('Projet PROJ-9999 introuvable');
    });
  });
});
