# Color Variables Refactoring - Design Spec

## Objectif

Centraliser les ~41 couleurs hexadecimales hardcodees dans un fichier de variables SCSS, extraire les styles inline des composants dans des fichiers `.scss` separes, et aligner le theme Material sur la couleur primaire reellement utilisee (indigo).

**Contraintes :**
- Zero changement visuel pour les utilisateurs
- Theme clair uniquement (pas de preparation dark mode)
- Nommage semantique pur (`$color-primary`, `$color-success`, etc.)

## 1. Fichier de variables

**Nouveau fichier :** `src/app/styles/_variables.scss`

```scss
// === Couleurs primaires ===
$color-primary: #3f51b5;
$color-primary-light: #e8eaf6;

// === Couleurs semantiques ===
$color-success: #4caf50;
$color-success-light: #c8e6c9;
$color-success-dark: #1b5e20;
$color-error: #d32f2f;
$color-error-light: #ffcdd2;
$color-error-dark: #b71c1c;
$color-warning: #f57c00;
$color-warning-light: #fff3e0;
$color-warning-alt: #ff9800;
$color-info: #2196f3;
$color-info-light: #bbdefb;
$color-info-dark: #0d47a1;

// === Texte ===
$color-text: #222;
$color-text-secondary: #555;
$color-text-muted: #888;
$color-text-subtle: #999;
$color-text-label: #666;

// === Surfaces & Bordures ===
$color-bg: #f5f5f7;
$color-bg-card: #fafafa;
$color-bg-hover: #f5f5f5;
$color-bg-summary: #fff8e1;
$color-border: #e0e0e0;
$color-border-light: #eee;
$color-divider: #f0f0f0;

// === Specifiques ===
$color-teal: #009688;
$color-purple: #673ab7;
$color-purple-light: #f3e5f5;
$color-purple-dark: #4a148c;
$color-role-badge: #607d8b;
$color-login-gradient-start: #f5f7fa;
$color-login-gradient-end: #c3cfe2;
$color-inactive: #eeeeee;
$color-gray: #424242;
```

## 2. Extraction des styles inline

Chaque composant avec `styles: [...]` dans son decorateur `@Component` sera transforme :

- Les styles inline sont deplaces dans un fichier `*.component.scss`
- Le decorateur utilise `styleUrl: './xxx.component.scss'`
- Chaque fichier SCSS importe les variables : `@use '../../styles/variables' as *;`
- Les couleurs hex hardcodees sont remplacees par les variables semantiques
- Aucun changement de template ni de logique

**Composants concernes (~19) :**
- `main-layout.component.ts`
- `login.component.ts`
- `dashboard.component.ts`
- `persons-list.component.ts`
- `person-form.component.ts`
- `person-detail.component.ts`
- `projets-list.component.ts`
- `projet-form.component.ts`
- `projet-detail.component.ts`
- `projet-contributors.component.ts`
- `projet-non-contributors.component.ts`
- `cotisations-list.component.ts`
- `cotisation-form.component.ts`
- `contributors.component.ts`
- `non-contributors.component.ts`
- `comptes-rendus-list.component.ts`
- `compte-rendu-form.component.ts`
- `compte-rendu-detail.component.ts`
- `historique.component.ts`

## 3. Mise a jour du theme Material

Dans `styles.scss` :

- Remplacer `mat.$violet-palette` par `mat.$indigo-palette`
- Importer les variables : `@use './app/styles/variables' as *;`
- Utiliser les variables pour les couleurs globales (body, snackbar)

```scss
@use './app/styles/variables' as *;

@include mat.theme((
  color: (
    theme-type: light,
    primary: mat.$indigo-palette,
    tertiary: mat.$blue-palette,
  ),
  typography: Roboto,
  density: 0,
));

body {
  background: $color-bg;
  color: $color-text;
}

.snack-success {
  --mdc-snackbar-container-color: #{$color-success-dark};
}

.snack-error {
  --mdc-snackbar-container-color: #{$color-error};
}
```

## 4. Resultat attendu

- Une seule source de verite pour toutes les couleurs
- Coherence entre le theme Material et les composants
- Separation propre styles/logique dans les composants Angular
- Zero changement visuel
