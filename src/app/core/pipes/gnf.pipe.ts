import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe pour formater les montants en GNF (Franc Guinéen).
 * Format : "50 000 GNF" (espace comme séparateur de milliers, sans décimales).
 *
 * Usage :
 *   {{ 50000 | gnf }}      → "50 000 GNF"
 *   {{ value | gnf:false }} → "50 000" (sans suffixe)
 */
@Pipe({
  name: 'gnf',
  standalone: true,
})
export class GnfPipe implements PipeTransform {
  transform(value: number | null | undefined, withSuffix = true): string {
    if (value == null || isNaN(value)) return withSuffix ? '0 GNF' : '0';
    const rounded = Math.round(value);
    const formatted = rounded
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // ajoute des espaces tous les 3 chiffres
    return withSuffix ? `${formatted} GNF` : formatted;
  }
}
