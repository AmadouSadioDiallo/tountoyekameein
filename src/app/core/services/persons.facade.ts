import { Injectable, inject } from '@angular/core';
import { PersonsRepository } from './persons.repository';
import { AuditService } from './audit.service';
import { Person, PersonFormData } from '../models/person.model';

/**
 * Façade Persons : combine le repository et l'audit.
 * Les composants utilisent ce service (pas le repository directement)
 * pour que l'audit soit toujours loggué.
 */
@Injectable({ providedIn: 'root' })
export class PersonsFacade {
  private readonly repo = inject(PersonsRepository);
  private readonly audit = inject(AuditService);

  findAll = () => this.repo.findAll();
  findById = (id: string) => this.repo.findById(id);

  async checkEmailAvailable(email: string, exceptId?: string): Promise<boolean> {
    return !(await this.repo.existsByEmail(email, exceptId));
  }

  async create(data: PersonFormData): Promise<Person> {
    if (await this.repo.existsByEmail(data.email)) {
      throw new Error(`L'email ${data.email} est déjà utilisé.`);
    }
    const person = await this.repo.create(data);
    await this.audit.log('CREATE', 'Person', person.id, { after: person });
    return person;
  }

  async update(id: string, data: PersonFormData): Promise<Person> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Personne ${id} introuvable.`);

    if (
      data.email.toLowerCase() !== before.email.toLowerCase() &&
      (await this.repo.existsByEmail(data.email, id))
    ) {
      throw new Error(`L'email ${data.email} est déjà utilisé.`);
    }
    const after = await this.repo.update(id, data);
    await this.audit.log('UPDATE', 'Person', id, { before, after });
    return after;
  }

  async delete(id: string): Promise<void> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Personne ${id} introuvable.`);
    await this.repo.softDelete(id);
    await this.audit.log('DELETE', 'Person', id, { before });
  }
}
