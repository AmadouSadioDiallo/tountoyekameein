import { Injectable, inject } from '@angular/core';
import { CotisationsRepository } from './cotisations.repository';
import { AuditService } from './audit.service';
import { Cotisation, CotisationFormData } from '../models/cotisation.model';

@Injectable({ providedIn: 'root' })
export class CotisationsFacade {
  private readonly repo = inject(CotisationsRepository);
  private readonly audit = inject(AuditService);

  findAll = () => this.repo.findAll();
  findById = (id: string) => this.repo.findById(id);
  findByPersonId = (personId: string) => this.repo.findByPersonId(personId);
  findByProjetId = (projetId: string) => this.repo.findByProjetId(projetId);
  getTotalsByPerson = () => this.repo.getTotalsByPerson();
  getTotalsByProjet = () => this.repo.getTotalsByProjet();
  getStatsByPersonForProjet = (projetId: string) => this.repo.getStatsByPersonForProjet(projetId);

  async create(data: CotisationFormData): Promise<Cotisation> {
    const cotisation = await this.repo.create(data);
    await this.audit.log('CREATE', 'Cotisation', cotisation.id, { after: cotisation });
    return cotisation;
  }

  async update(id: string, data: CotisationFormData): Promise<Cotisation> {
    const before = await this.repo.findById(id);
    const after = await this.repo.update(id, data);
    await this.audit.log('UPDATE', 'Cotisation', id, { before, after });
    return after;
  }

  async delete(id: string): Promise<void> {
    const before = await this.repo.findById(id);
    await this.repo.softDelete(id);
    await this.audit.log('DELETE', 'Cotisation', id, { before });
  }
}
