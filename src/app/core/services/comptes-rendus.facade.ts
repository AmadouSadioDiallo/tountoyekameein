import { Injectable, inject } from '@angular/core';
import { ComptesRendusRepository } from './comptes-rendus.repository';
import { AuditService } from './audit.service';
import { CompteRendu, CompteRenduFormData } from '../models/compte-rendu.model';

@Injectable({ providedIn: 'root' })
export class ComptesRendusFacade {
  private readonly repo = inject(ComptesRendusRepository);
  private readonly audit = inject(AuditService);

  findAll = () => this.repo.findAll();
  findById = (id: string) => this.repo.findById(id);

  async create(data: CompteRenduFormData): Promise<CompteRendu> {
    const cr = await this.repo.create(data);
    await this.audit.log('CREATE', 'CompteRendu', cr.id, { after: cr });
    return cr;
  }

  async update(id: string, data: CompteRenduFormData): Promise<CompteRendu> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Compte rendu ${id} introuvable`);
    const after = await this.repo.update(id, data);
    await this.audit.log('UPDATE', 'CompteRendu', id, { before, after });
    return after;
  }

  async delete(id: string): Promise<void> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Compte rendu ${id} introuvable`);
    await this.repo.softDelete(id);
    await this.audit.log('DELETE', 'CompteRendu', id, { before });
  }
}
