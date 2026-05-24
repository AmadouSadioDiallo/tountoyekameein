import { Injectable, inject } from '@angular/core';
import { ProjetsRepository } from './projets.repository';
import { AuditService } from './audit.service';
import { Projet, ProjetFormData } from '../models/projet.model';

@Injectable({ providedIn: 'root' })
export class ProjetsFacade {
  private readonly repo = inject(ProjetsRepository);
  private readonly audit = inject(AuditService);

  /** Par défaut, n'inclut PAS les archivés. */
  findAll = (includeArchived = false) => this.repo.findAll(includeArchived);
  findById = (id: string) => this.repo.findById(id);

  async create(data: ProjetFormData): Promise<Projet> {
    const projet = await this.repo.create(data);
    await this.audit.log('CREATE', 'Projet', projet.id, { after: projet });
    return projet;
  }

  async update(id: string, data: ProjetFormData): Promise<Projet> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Projet ${id} introuvable`);
    const after = await this.repo.update(id, data);
    await this.audit.log('UPDATE', 'Projet', id, { before, after });
    return after;
  }

  async archive(id: string): Promise<Projet> {
    const projet = await this.repo.setArchive(id, true);
    await this.audit.log('ARCHIVE', 'Projet', id, { projet });
    return projet;
  }

  async unarchive(id: string): Promise<Projet> {
    const projet = await this.repo.setArchive(id, false);
    await this.audit.log('UNARCHIVE', 'Projet', id, { projet });
    return projet;
  }

  async delete(id: string): Promise<void> {
    const before = await this.repo.findById(id);
    if (!before) throw new Error(`Projet ${id} introuvable`);
    await this.repo.softDelete(id);
    await this.audit.log('DELETE', 'Projet', id, { before });
  }
}
