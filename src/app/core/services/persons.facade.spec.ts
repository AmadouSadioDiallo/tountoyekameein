import { TestBed } from '@angular/core/testing';
import { PersonsFacade } from './persons.facade';
import { PersonsRepository } from './persons.repository';
import { AuditService } from './audit.service';
import { Person } from '../models';

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockAudit = {
  log: jest.fn().mockResolvedValue(undefined),
};

const PERSON_STUB: Person = {
  id: 'PERS-0001',
  civilite: 'M.',
  nom: 'Diallo',
  prenom: 'Mamadou',
  email: 'mamadou@test.com',
  villeNaissance: 'Conakry',
  paysNaissance: 'Guinée',
  adresse: '10 rue Test',
  ville: 'Conakry',
  pays: 'Guinée',
  statut: 'Actif',
  dateCreation: '2025-01-01T00:00:00.000Z',
  dateModif: '2025-01-01T00:00:00.000Z',
  supprime: false,
};

describe('PersonsFacade', () => {
  let facade: PersonsFacade;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PersonsFacade,
        { provide: PersonsRepository, useValue: mockRepo },
        { provide: AuditService, useValue: mockAudit },
      ],
    });
    facade = TestBed.inject(PersonsFacade);
  });

  describe('findAll', () => {
    it('should delegate to repository', async () => {
      mockRepo.findAll.mockResolvedValue([PERSON_STUB]);

      const result = await facade.findAll();

      expect(result).toEqual([PERSON_STUB]);
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should delegate to repository', async () => {
      mockRepo.findById.mockResolvedValue(PERSON_STUB);

      const result = await facade.findById('PERS-0001');

      expect(result).toEqual(PERSON_STUB);
    });
  });

  describe('checkEmailAvailable', () => {
    it('should return true when email does not exist', async () => {
      mockRepo.existsByEmail.mockResolvedValue(false);

      expect(await facade.checkEmailAvailable('new@test.com')).toBe(true);
    });

    it('should return false when email exists', async () => {
      mockRepo.existsByEmail.mockResolvedValue(true);

      expect(await facade.checkEmailAvailable('existing@test.com')).toBe(false);
    });
  });

  describe('create', () => {
    const formData = {
      civilite: 'M.' as const,
      nom: 'Sow',
      prenom: 'Alpha',
      email: 'alpha@test.com',
      villeNaissance: 'Labé',
      paysNaissance: 'Guinée',
      adresse: '5 rue Test',
      ville: 'Labé',
      pays: 'Guinée',
      statut: 'Actif' as const,
    };

    it('should create person and log audit', async () => {
      mockRepo.existsByEmail.mockResolvedValue(false);
      mockRepo.create.mockResolvedValue({ ...PERSON_STUB, ...formData, id: 'PERS-0002' });

      const result = await facade.create(formData as any);

      expect(result.id).toBe('PERS-0002');
      expect(mockRepo.create).toHaveBeenCalledWith(formData);
      expect(mockAudit.log).toHaveBeenCalledWith('CREATE', 'Person', 'PERS-0002', { after: result });
    });

    it('should throw when email already exists', async () => {
      mockRepo.existsByEmail.mockResolvedValue(true);

      await expect(facade.create(formData as any)).rejects.toThrow("L'email alpha@test.com est déjà utilisé.");
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockAudit.log).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const formData = {
      civilite: 'M.' as const,
      nom: 'Diallo-Updated',
      prenom: 'Mamadou',
      email: 'mamadou@test.com',
      villeNaissance: 'Conakry',
      paysNaissance: 'Guinée',
      adresse: '10 rue Test',
      ville: 'Conakry',
      pays: 'Guinée',
      statut: 'Actif' as const,
    };

    it('should update person and log audit with before/after', async () => {
      mockRepo.findById.mockResolvedValue(PERSON_STUB);
      mockRepo.existsByEmail.mockResolvedValue(false);
      const updated = { ...PERSON_STUB, nom: 'Diallo-Updated' };
      mockRepo.update.mockResolvedValue(updated);

      const result = await facade.update('PERS-0001', formData as any);

      expect(result.nom).toBe('Diallo-Updated');
      expect(mockAudit.log).toHaveBeenCalledWith('UPDATE', 'Person', 'PERS-0001', {
        before: PERSON_STUB,
        after: updated,
      });
    });

    it('should throw when person not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(facade.update('PERS-9999', formData as any)).rejects.toThrow('Personne PERS-9999 introuvable.');
    });

    it('should throw when changing to an existing email', async () => {
      mockRepo.findById.mockResolvedValue(PERSON_STUB);
      mockRepo.existsByEmail.mockResolvedValue(true);

      const dataWithNewEmail = { ...formData, email: 'taken@test.com' };
      await expect(facade.update('PERS-0001', dataWithNewEmail as any)).rejects.toThrow(
        "L'email taken@test.com est déjà utilisé.",
      );
    });

    it('should not check email uniqueness when email unchanged', async () => {
      mockRepo.findById.mockResolvedValue(PERSON_STUB);
      mockRepo.update.mockResolvedValue(PERSON_STUB);

      await facade.update('PERS-0001', formData as any);

      expect(mockRepo.existsByEmail).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete and log audit', async () => {
      mockRepo.findById.mockResolvedValue(PERSON_STUB);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await facade.delete('PERS-0001');

      expect(mockRepo.softDelete).toHaveBeenCalledWith('PERS-0001');
      expect(mockAudit.log).toHaveBeenCalledWith('DELETE', 'Person', 'PERS-0001', { before: PERSON_STUB });
    });

    it('should throw when person not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(facade.delete('PERS-9999')).rejects.toThrow('Personne PERS-9999 introuvable.');
    });
  });
});
