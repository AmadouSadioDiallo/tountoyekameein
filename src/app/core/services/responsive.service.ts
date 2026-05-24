import { Injectable, computed, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

/**
 * Service centralisé pour la détection responsive.
 * Utilise les breakpoints standards d'Angular Material.
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private readonly observer = inject(BreakpointObserver);

  /** True si l'écran est < 600px (mobile). */
  readonly isMobile = signal(false);
  /** True si l'écran est < 960px (mobile + tablette portrait). */
  readonly isHandset = signal(false);
  /** True si l'écran est >= 960px (desktop). */
  readonly isDesktop = computed(() => !this.isHandset());

  constructor() {
    this.observer.observe([Breakpoints.XSmall]).subscribe((state) => {
      this.isMobile.set(state.matches);
    });

    this.observer.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).subscribe((state) => {
      this.isHandset.set(state.matches);
    });
  }
}
