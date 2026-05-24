import { Pipe, PipeTransform } from '@angular/core';

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
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return withSuffix ? `${formatted} GNF` : formatted;
  }
}
