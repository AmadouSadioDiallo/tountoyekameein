# Color Variables Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize all hardcoded hex colors into a SCSS variables file, extract inline styles from components into `.component.scss` files, and align the Material theme with the actual primary color (indigo).

**Architecture:** Create `src/app/styles/_variables.scss` as single source of truth. Each component gets a dedicated `.component.scss` file that imports the variables. Inline `style=` attributes in templates are replaced with CSS classes.

**Tech Stack:** Angular 21, SCSS, Angular Material 21

**Note:** This project has no unit tests. Verification is done via `ng build` after each task to confirm compilation. No visual changes should occur.

---

## File Structure

**Create:**
- `src/app/styles/_variables.scss` — centralized color definitions
- `src/app/layouts/main-layout.component.scss`
- `src/app/features/auth/login.component.scss`
- `src/app/features/dashboard/dashboard.component.scss`
- `src/app/features/persons/persons-list.component.scss`
- `src/app/features/persons/person-form.component.scss`
- `src/app/features/persons/person-detail.component.scss`
- `src/app/features/projets/projets-list.component.scss`
- `src/app/features/projets/projet-form.component.scss`
- `src/app/features/projets/projet-detail.component.scss`
- `src/app/features/projets/projet-contributors.component.scss`
- `src/app/features/projets/projet-non-contributors.component.scss`
- `src/app/features/cotisations/cotisations-list.component.scss`
- `src/app/features/cotisations/cotisation-form.component.scss`
- `src/app/features/cotisations/contributors.component.scss`
- `src/app/features/cotisations/non-contributors.component.scss`
- `src/app/features/comptes-rendus/comptes-rendus-list.component.scss`
- `src/app/features/comptes-rendus/compte-rendu-form.component.scss`
- `src/app/features/comptes-rendus/compte-rendu-detail.component.scss`
- `src/app/features/historique/historique.component.scss`

**Modify:**
- `src/styles.scss` — update Material palette + use variables
- All 19 component `.ts` files — replace `styles:` with `styleUrl:`, replace inline `style=` with CSS classes

---

### Task 1: Create `_variables.scss` and update `styles.scss`

**Files:**
- Create: `src/app/styles/_variables.scss`
- Modify: `src/styles.scss`

- [ ] **Step 1: Create `_variables.scss`**

Create `src/app/styles/_variables.scss`:

```scss
// === Primary ===
$color-primary: #3f51b5;
$color-primary-light: #e8eaf6;

// === Success ===
$color-success: #4caf50;
$color-success-light: #c8e6c9;
$color-success-dark: #1b5e20;
$color-success-bg: #e8f5e9;

// === Error ===
$color-error: #d32f2f;
$color-error-bright: #f44336;
$color-error-light: #ffcdd2;
$color-error-dark: #b71c1c;

// === Warning ===
$color-warning: #f57c00;
$color-warning-light: #fff3e0;
$color-warning-alt: #ff9800;
$color-warning-dark: #e65100;

// === Info ===
$color-info: #2196f3;
$color-info-light: #bbdefb;
$color-info-bg: #e3f2fd;
$color-info-dark: #0d47a1;

// === Text ===
$color-text: #222;
$color-text-dark: #333;
$color-text-secondary: #555;
$color-text-label: #666;
$color-text-muted: #888;
$color-text-subtle: #999;

// === Surfaces ===
$color-bg: #f5f5f7;
$color-bg-card: #fafafa;
$color-bg-hover: #f5f5f5;
$color-bg-summary: #fff8e1;

// === Borders ===
$color-border: #e0e0e0;
$color-border-light: #eee;
$color-divider: #f0f0f0;

// === Accents ===
$color-teal: #009688;
$color-purple: #673ab7;
$color-purple-light: #f3e5f5;
$color-purple-dark: #4a148c;

// === Specific ===
$color-role-badge: #607d8b;
$color-login-gradient-start: #f5f7fa;
$color-login-gradient-end: #c3cfe2;
$color-inactive: #eeeeee;
$color-gray: #424242;
$color-snack-success: #2e7d32;
$color-snack-error: #c62828;
$color-border-dashed: #aaa;
```

- [ ] **Step 2: Update `styles.scss`**

Replace the contents of `src/styles.scss`:

```scss
@use '@angular/material' as mat;
@use './app/styles/variables' as *;

html {
  color-scheme: light;
  @include mat.theme((
    color: (
      theme-type: light,
      primary: mat.$indigo-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

html, body { height: 100%; }
body {
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
  background: $color-bg;
  color: $color-text;
  -webkit-tap-highlight-color: transparent;
}

* { box-sizing: border-box; }

.snack-success {
  --mdc-snackbar-container-color: #{$color-snack-success};
  --mdc-snackbar-supporting-text-color: white;
  --mat-snack-bar-button-color: white;
}
.snack-error {
  --mdc-snackbar-container-color: #{$color-snack-error};
  --mdc-snackbar-supporting-text-color: white;
  --mat-snack-bar-button-color: white;
}

@media (max-width: 599px) {
  h1 { font-size: 1.4rem !important; }
  h2 { font-size: 1.2rem !important; }
  h3 { font-size: 1rem !important; }

  .mat-mdc-dialog-container {
    max-width: 95vw !important;
  }

  .mat-mdc-snack-bar-container {
    margin-bottom: 1rem !important;
  }

  .mat-mdc-paginator-page-size {
    display: none !important;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  h1 { font-size: 1.5rem; }
}

@media (pointer: coarse) {
  .mat-mdc-icon-button {
    min-width: 44px;
    min-height: 44px;
  }
}
```

- [ ] **Step 3: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL (no errors)

- [ ] **Step 4: Commit**

```bash
git add src/app/styles/_variables.scss src/styles.scss
git commit -m "feat: create color variables file and update Material theme to indigo"
```

---

### Task 2: Extract styles — main-layout and login

**Files:**
- Create: `src/app/layouts/main-layout.component.scss`
- Create: `src/app/features/auth/login.component.scss`
- Modify: `src/app/layouts/main-layout.component.ts`
- Modify: `src/app/features/auth/login.component.ts`

- [ ] **Step 1: Create `main-layout.component.scss`**

Create `src/app/layouts/main-layout.component.scss`:

```scss
@use '../../styles/variables' as *;

.layout { height: 100vh; }
.sidenav {
  width: 260px;
  background: $color-bg-card;
  border-right: 1px solid $color-border;
}
.sidenav.mobile { width: 280px; }
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid $color-border;
}
.brand-icon { font-size: 2rem; width: 2rem; height: 2rem; color: $color-primary; }
.brand-title { font-weight: 600; font-size: 1.05rem; }
.brand-sub { font-size: 0.8rem; color: $color-text-muted; }
.topbar { gap: 0.5rem; }
.topbar-title { font-size: 1rem; font-weight: 500; }
.spacer { flex: 1 1 auto; }
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 0.5rem;
  vertical-align: middle;
}
.user-name { margin-right: 0.5rem; }
.user-btn { min-width: 0; padding: 0 0.5rem; }
.role-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: $color-role-badge;
  color: white;
}
.role-badge.admin { background: $color-error; }
.content {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
.mobile-content { padding: 1rem; }
.active-link {
  background: $color-primary-light !important;
  color: $color-primary !important;
}
.active-link mat-icon { color: $color-primary; }
```

- [ ] **Step 2: Update `main-layout.component.ts`**

In `main-layout.component.ts`, replace `styles: [...]` with:

```typescript
styleUrl: './main-layout.component.scss'
```

Remove the entire `styles: [` ... `]` block.

- [ ] **Step 3: Create `login.component.scss`**

Create `src/app/features/auth/login.component.scss`:

```scss
@use '../../../styles/variables' as *;

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $color-login-gradient-start 0%, $color-login-gradient-end 100%);
  padding: 1rem;
}
.login-card {
  max-width: 420px;
  width: 100%;
  padding: 1rem;
}
.info {
  color: $color-text-secondary;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.google-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}
.loading-text {
  text-align: center;
  color: $color-text-muted;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}
```

- [ ] **Step 4: Update `login.component.ts`**

In `login.component.ts`, replace `styles: [...]` with:

```typescript
styleUrl: './login.component.scss'
```

- [ ] **Step 5: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add src/app/layouts/ src/app/features/auth/
git commit -m "refactor: extract styles for main-layout and login components"
```

---

### Task 3: Extract styles — dashboard

**Files:**
- Create: `src/app/features/dashboard/dashboard.component.scss`
- Modify: `src/app/features/dashboard/dashboard.component.ts`

- [ ] **Step 1: Create `dashboard.component.scss`**

Create `src/app/features/dashboard/dashboard.component.scss`:

```scss
@use '../../../styles/variables' as *;

.page-title { margin-bottom: 2rem; font-weight: 500; }
.section-title { margin: 2rem 0 1rem; font-weight: 500; font-size: 1.25rem; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.stat-card {
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.stat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
.stat-value { font-size: 2rem; font-weight: 600; margin-top: 0.5rem; }
.stat-label { color: $color-text-label; font-size: 0.95rem; margin-top: 0.25rem; }
.stat-sub { color: $color-text-subtle; font-size: 0.8rem; margin-top: 0.5rem; }
.projets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.projet-card { padding: 1.5rem; cursor: pointer; transition: box-shadow 0.15s; }
.projet-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.projet-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.projet-card-header h3 { margin: 0; font-size: 1.05rem; }
.chip { padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 500; }
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-terminé { background: $color-info-light; color: $color-info-dark; }
.chip-annulé { background: $color-error-light; color: $color-error-dark; }
.projet-amounts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: $color-text-secondary;
}
.actions { margin-top: 2rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
.error-card { padding: 1rem; display: flex; gap: 1rem; align-items: center; }

.icon-primary { color: $color-primary; }
.icon-teal { color: $color-teal; }
.icon-purple { color: $color-purple; }
```

- [ ] **Step 2: Update `dashboard.component.ts`**

Replace `styles: [...]` with:

```typescript
styleUrl: './dashboard.component.scss'
```

Replace inline `style="color:#3f51b5"` with `class="icon-primary"`, `style="color:#009688"` with `class="icon-teal"`, and `style="color:#673ab7"` with `class="icon-purple"` in the template.

- [ ] **Step 3: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit**

```bash
git add src/app/features/dashboard/
git commit -m "refactor: extract styles for dashboard component"
```

---

### Task 4: Extract styles — persons (list, form, detail)

**Files:**
- Create: `src/app/features/persons/persons-list.component.scss`
- Create: `src/app/features/persons/person-form.component.scss`
- Create: `src/app/features/persons/person-detail.component.scss`
- Modify: `src/app/features/persons/persons-list.component.ts`
- Modify: `src/app/features/persons/person-form.component.ts`
- Modify: `src/app/features/persons/person-detail.component.ts`

- [ ] **Step 1: Create `persons-list.component.scss`**

Create `src/app/features/persons/persons-list.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}
.header h1 { margin: 0; }
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-field { flex: 1; min-width: 240px; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.table-container { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.actions-col { width: 140px; text-align: right; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }
.summary { margin-top: 0.75rem; color: $color-text-label; font-size: 0.9rem; }
.chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-inactif { background: $color-inactive; color: $color-gray; }
.chip-en-attente { background: $color-warning-light; color: $color-warning-dark; }

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.person-card { padding: 1rem; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.card-title { display: flex; flex-direction: column; gap: 0.25rem; }
.card-title strong { font-size: 1rem; }
.card-id { font-size: 0.75rem; color: $color-text-muted; }
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: $color-text-secondary;
}
.card-row mat-icon {
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
  color: $color-text-subtle;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  border-top: 1px solid $color-divider;
  padding-top: 0.5rem;
}
.empty-card {
  padding: 2rem;
  text-align: center;
  color: $color-text-muted;
  font-style: italic;
}
```

- [ ] **Step 2: Create `person-form.component.scss`**

Create `src/app/features/persons/person-form.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.header h1 { margin: 0; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.form-card { padding: 2rem; }
.section-title {
  margin: 1.5rem 0 1rem;
  color: $color-primary;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.section-title:first-child { margin-top: 0; }
.optional {
  text-transform: none;
  font-weight: 400;
  color: $color-text-muted;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.full { grid-column: 1 / -1; }
mat-divider { margin: 1rem 0; }
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid $color-border-light;
}
```

- [ ] **Step 3: Create `person-detail.component.scss`**

Create `src/app/features/persons/person-detail.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.header h1 { margin: 0; flex: 1; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.detail-card, .cotisations-card { padding: 2rem; margin-bottom: 1.5rem; }
.section-title {
  margin: 1.5rem 0 1rem;
  color: $color-primary;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid $color-primary-light;
}
.section-title:first-child { margin-top: 0; }
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.5rem;
  margin-bottom: 0.5rem;
}
.field { display: flex; flex-direction: column; gap: 0.25rem; }
.field.full { grid-column: 1 / -1; }
.field label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: $color-text-muted;
}
.field span { font-size: 1rem; color: $color-text; }
.notes-content { white-space: pre-wrap; }
.cot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.cot-header h2 { margin: 0; }
.total { font-size: 1.1rem; }
.empty { color: $color-text-muted; font-style: italic; }
.table-wrap { overflow: auto; }
table { width: 100%; }
```

- [ ] **Step 4: Update all three `.ts` files**

In each of `persons-list.component.ts`, `person-form.component.ts`, `person-detail.component.ts`, replace `styles: [...]` with:

```typescript
styleUrl: './persons-list.component.scss'  // (or person-form / person-detail)
```

- [ ] **Step 5: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add src/app/features/persons/
git commit -m "refactor: extract styles for persons components"
```

---

### Task 5: Extract styles — projets (list, form, detail)

**Files:**
- Create: `src/app/features/projets/projets-list.component.scss`
- Create: `src/app/features/projets/projet-form.component.scss`
- Create: `src/app/features/projets/projet-detail.component.scss`
- Modify: `src/app/features/projets/projets-list.component.ts`
- Modify: `src/app/features/projets/projet-form.component.ts`
- Modify: `src/app/features/projets/projet-detail.component.ts`

- [ ] **Step 1: Create `projets-list.component.scss`**

Create `src/app/features/projets/projets-list.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.header h1 { margin: 0; }
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
}
.search-field { flex: 1; min-width: 240px; }
.archive-toggle { margin-left: 0.5rem; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.table-container { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.link { color: $color-primary; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
.actions-col { width: 180px; text-align: right; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }
.summary { margin-top: 0.75rem; color: $color-text-label; font-size: 0.9rem; }
.chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-terminé { background: $color-info-light; color: $color-info-dark; }
.chip-annulé { background: $color-error-light; color: $color-error-dark; }
.chip-archive {
  background: $color-bg-hover;
  color: $color-text-secondary;
  border: 1px dashed $color-border-dashed;
}
.chip-archive-inline {
  margin-left: 0.5rem;
  font-size: 0.7rem;
  color: $color-text-muted;
  font-style: italic;
}
.row-archived { opacity: 0.65; }
.progress-wrap { display: flex; align-items: center; gap: 0.75rem; min-width: 200px; }
.progress-wrap mat-progress-bar { flex: 1; }
.pct { font-size: 0.85rem; color: $color-text-secondary; min-width: 50px; text-align: right; }
.badges { display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end; }

.cards-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.projet-card { padding: 1rem; cursor: pointer; }
.projet-card.archived { opacity: 0.7; background: $color-bg-card; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.card-title { display: flex; flex-direction: column; gap: 0.25rem; }
.card-title strong { font-size: 1rem; }
.card-id { font-size: 0.75rem; color: $color-text-muted; }
.card-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}
.card-amounts > div { display: flex; flex-direction: column; gap: 0.15rem; }
.label { font-size: 0.7rem; text-transform: uppercase; color: $color-text-muted; }
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid $color-divider;
}
.empty-card { padding: 2rem; text-align: center; color: $color-text-muted; font-style: italic; }
```

- [ ] **Step 2: Create `projet-form.component.scss`**

Create `src/app/features/projets/projet-form.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.header h1 { margin: 0; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.form-card { padding: 2rem; max-width: 800px; }
.full { width: 100%; display: block; margin-bottom: 1rem; }
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.row mat-form-field { width: 100%; }
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid $color-border-light;
}
```

- [ ] **Step 3: Create `projet-detail.component.scss`**

Create `src/app/features/projets/projet-detail.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.header h1 { margin: 0; flex: 1; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.detail-card, .cotisations-card { padding: 2rem; margin-bottom: 1.5rem; }
.cr-counter-card {
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.cr-counter-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}
.cr-counter {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cr-icon {
  font-size: 2rem;
  width: 2rem;
  height: 2rem;
  color: $color-primary;
}
.cr-info { flex: 1; }
.cr-count { font-size: 1rem; color: $color-text-dark; }
.cr-count strong { font-size: 1.5rem; color: $color-primary; margin-right: 0.25rem; }
.cr-sub { font-size: 0.85rem; color: $color-text-muted; margin-top: 0.25rem; }
.cr-arrow { color: $color-text-subtle; }

.contributors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.contrib-card {
  padding: 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}
.contrib-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.contrib-yes { border-left: 4px solid $color-success; }
.contrib-no { border-left: 4px solid $color-warning; }
.contrib-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.contrib-icon {
  font-size: 2rem;
  width: 2rem;
  height: 2rem;
}
.contrib-icon.yes { color: $color-success; }
.contrib-icon.no { color: $color-warning; }
.contrib-arrow { color: $color-text-subtle; }
.contrib-count {
  font-size: 2.5rem;
  font-weight: 600;
  color: $color-text-dark;
  line-height: 1.1;
}
.contrib-label {
  font-size: 0.95rem;
  color: $color-text-secondary;
  margin-bottom: 0.5rem;
}
.contrib-sub {
  font-size: 0.85rem;
  color: $color-text-muted;
}
.detail-card.archived { background: $color-bg-card; }
.archived-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: $color-warning-light;
  color: $color-warning-dark;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}
.projet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}
.projet-header h2 { margin: 0; }
.chip {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-terminé { background: $color-info-light; color: $color-info-dark; }
.chip-annulé { background: $color-error-light; color: $color-error-dark; }
.description {
  color: $color-text-secondary;
  white-space: pre-wrap;
  margin: 1rem 0 1.5rem;
  line-height: 1.5;
}
.amounts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
  padding: 1rem 0;
  border-top: 1px solid $color-border-light;
  border-bottom: 1px solid $color-border-light;
}
.amount-block { text-align: center; }
.amount-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: $color-text-muted;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}
.amount-value { font-size: 1.4rem; font-weight: 600; color: $color-text-dark; }
.amount-value.highlight { color: $color-primary; }
.progress-section { margin-top: 1.5rem; }
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.meta {
  margin-top: 1.5rem;
  display: flex;
  gap: 2rem;
  color: $color-text-muted;
  font-size: 0.85rem;
  flex-wrap: wrap;
}
.cot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.cot-header h2 { margin: 0; }
.empty { color: $color-text-muted; font-style: italic; }
.table-wrap { overflow: auto; }
table { width: 100%; }
.link { color: $color-primary; text-decoration: none; }
.link:hover { text-decoration: underline; }
.muted { color: $color-text-muted; }
```

- [ ] **Step 4: Update all three `.ts` files**

In each of `projets-list.component.ts`, `projet-form.component.ts`, `projet-detail.component.ts`, replace `styles: [...]` with the corresponding `styleUrl:`.

- [ ] **Step 5: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add src/app/features/projets/projets-list.component.* src/app/features/projets/projet-form.component.* src/app/features/projets/projet-detail.component.*
git commit -m "refactor: extract styles for projets list, form, and detail components"
```

---

### Task 6: Extract styles — projet-contributors and projet-non-contributors

**Files:**
- Create: `src/app/features/projets/projet-contributors.component.scss`
- Create: `src/app/features/projets/projet-non-contributors.component.scss`
- Modify: `src/app/features/projets/projet-contributors.component.ts`
- Modify: `src/app/features/projets/projet-non-contributors.component.ts`

- [ ] **Step 1: Create `projet-contributors.component.scss`**

Create `src/app/features/projets/projet-contributors.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.header h1 { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.title-icon { color: $color-success; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.projet-info-card { padding: 1.5rem; margin-bottom: 1rem; }
.projet-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}
.projet-info .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: $color-text-muted;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.projet-link { color: $color-primary; text-decoration: none; font-weight: 500; font-size: 1.05rem; }
.projet-link:hover { text-decoration: underline; }
.chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-terminé { background: $color-info-light; color: $color-info-dark; }
.chip-annulé { background: $color-error-light; color: $color-error-dark; }
.summary-card { padding: 1.5rem; margin-bottom: 1rem; }
.summary-row { display: flex; gap: 2.5rem; flex-wrap: wrap; }
.summary-item { display: flex; align-items: center; gap: 1rem; }
.summary-item mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
.metric-value { font-size: 1.5rem; font-weight: 600; color: $color-text-dark; }
.metric-label { color: $color-text-muted; font-size: 0.85rem; }
.search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
.table-wrap { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.link { color: $color-primary; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
.total { color: $color-primary; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }

.icon-success { color: $color-success; }
.icon-primary { color: $color-primary; }
.icon-warning-alt { color: $color-warning-alt; }

.cards-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.contrib-card { padding: 1rem; cursor: pointer; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.card-header strong { font-size: 1rem; }
.card-id { font-size: 0.75rem; color: $color-text-muted; }
.card-amounts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid $color-divider;
  border-bottom: 1px solid $color-divider;
}
.card-amounts > div { display: flex; flex-direction: column; gap: 0.25rem; }
.label { font-size: 0.7rem; text-transform: uppercase; color: $color-text-muted; }
.card-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: $color-text-secondary;
}
.card-contact mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: $color-text-muted; }
.card-pere {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: $color-text-secondary;
  font-style: italic;
}
.card-pere mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: $color-text-muted; }
.empty-card { padding: 2rem; text-align: center; color: $color-text-muted; font-style: italic; }
```

- [ ] **Step 2: Create `projet-non-contributors.component.scss`**

Create `src/app/features/projets/projet-non-contributors.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.header h1 { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.title-icon { color: $color-warning; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.projet-info-card { padding: 1.5rem; margin-bottom: 1rem; }
.projet-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}
.projet-info .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: $color-text-muted;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.projet-link { color: $color-primary; text-decoration: none; font-weight: 500; font-size: 1.05rem; }
.projet-link:hover { text-decoration: underline; }
.chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
.chip-actif { background: $color-success-light; color: $color-success-dark; }
.chip-terminé { background: $color-info-light; color: $color-info-dark; }
.chip-annulé { background: $color-error-light; color: $color-error-dark; }
.summary-card { padding: 1.25rem 1.5rem; margin-bottom: 1rem; background: $color-bg-summary; }
.summary-info { display: flex; align-items: center; gap: 1rem; }
.summary-info mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
.summary-info strong { font-size: 1.25rem; color: $color-warning; }
.hint { font-size: 0.85rem; color: $color-text-muted; margin-top: 0.25rem; }
.search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
.table-wrap { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.link { color: $color-primary; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
.no-data { text-align: center; padding: 2rem; color: $color-success; font-weight: 500; }

.icon-warning { color: $color-warning; }

.cards-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.person-card { padding: 1rem; cursor: pointer; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.card-header strong { font-size: 1rem; }
.card-id { font-size: 0.75rem; color: $color-text-muted; }
.card-body { display: flex; flex-direction: column; gap: 0.4rem; }
.card-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: $color-text-secondary; }
.card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: $color-text-muted; }
.empty-card {
  padding: 2rem;
  text-align: center;
  color: $color-success;
  font-weight: 500;
  background: $color-success-bg;
}
```

- [ ] **Step 3: Update both `.ts` files**

In `projet-contributors.component.ts`:
- Replace `styles: [...]` with `styleUrl: './projet-contributors.component.scss'`
- In template, replace `style="color:#4caf50"` with `class="icon-success"`, `style="color:#3f51b5"` with `class="icon-primary"`, `style="color:#ff9800"` with `class="icon-warning-alt"`

In `projet-non-contributors.component.ts`:
- Replace `styles: [...]` with `styleUrl: './projet-non-contributors.component.scss'`
- In template, replace `style="color:#f57c00"` with `class="icon-warning"`

- [ ] **Step 4: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add src/app/features/projets/projet-contributors.component.* src/app/features/projets/projet-non-contributors.component.*
git commit -m "refactor: extract styles for projet contributors components"
```

---

### Task 7: Extract styles — cotisations (list, form, contributors, non-contributors)

**Files:**
- Create: `src/app/features/cotisations/cotisations-list.component.scss`
- Create: `src/app/features/cotisations/cotisation-form.component.scss`
- Create: `src/app/features/cotisations/contributors.component.scss`
- Create: `src/app/features/cotisations/non-contributors.component.scss`
- Modify: corresponding `.ts` files

- [ ] **Step 1: Create `cotisations-list.component.scss`**

Create `src/app/features/cotisations/cotisations-list.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.header h1 { margin: 0; }
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-field { flex: 1; min-width: 200px; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.summary-card { padding: 1rem 1.5rem !important; margin-bottom: 1rem; }
.summary-row { display: flex; gap: 3rem; flex-wrap: wrap; }
.summary-item { display: flex; gap: 0.5rem; align-items: center; }
.summary-item strong { color: $color-primary; font-size: 1.1rem; }
.table-container { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.actions-col { width: 100px; text-align: right; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }
.link { color: $color-primary; text-decoration: none; }
.link:hover { text-decoration: underline; }
.muted { color: $color-text-muted; }
.cards-grid { display: flex; flex-direction: column; gap: 0.75rem; }
.cot-card { padding: 1rem; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.card-amount { font-size: 1.25rem; font-weight: 600; color: $color-primary; }
.card-date { color: $color-text-muted; font-size: 0.85rem; }
.card-body { display: flex; flex-direction: column; gap: 0.5rem; }
.card-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: $color-text-muted; }
.card-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
.chip-mode { background: $color-info-bg; color: $color-info-dark; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; }
.chip-periode { background: $color-purple-light; color: $color-purple-dark; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; }
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid $color-divider;
}
.empty-card { padding: 2rem; text-align: center; color: $color-text-muted; font-style: italic; }
```

- [ ] **Step 2: Create `cotisation-form.component.scss`**

Create `src/app/features/cotisations/cotisation-form.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.header h1 { margin: 0; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.form-card { padding: 2rem; max-width: 900px; }
.section-title {
  margin: 1.5rem 0 1rem;
  color: $color-primary;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
}
.section-title:first-child { margin-top: 0; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.full { width: 100%; display: block; margin-top: 1rem; }
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid $color-border-light;
}
```

- [ ] **Step 3: Create `contributors.component.scss`**

Create `src/app/features/cotisations/contributors.component.scss`:

```scss
@use '../../../styles/variables' as *;

h1 { margin-bottom: 1.5rem; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.summary-card { padding: 1.5rem; margin-bottom: 1.5rem; }
.summary { display: flex; gap: 3rem; flex-wrap: wrap; }
.metric { display: flex; align-items: center; gap: 1rem; }
.metric mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
.metric-value { font-size: 1.75rem; font-weight: 600; }
.metric-label { color: $color-text-label; font-size: 0.9rem; }
.search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
.table-wrap { overflow: auto; }
table { width: 100%; background: white; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }

.icon-teal { color: $color-teal; }
.icon-purple { color: $color-purple; }
```

- [ ] **Step 4: Create `non-contributors.component.scss`**

Create `src/app/features/cotisations/non-contributors.component.scss`:

```scss
@use '../../../styles/variables' as *;

h1 { margin-bottom: 1.5rem; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.summary-card { padding: 1.5rem; margin-bottom: 1.5rem; }
.metric { display: flex; align-items: center; gap: 1rem; }
.metric mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
.metric-value { font-size: 1.75rem; font-weight: 600; }
.metric-label { color: $color-text-label; font-size: 0.9rem; }
.search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
table { width: 100%; background: white; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }

.icon-warning-alt { color: $color-warning-alt; }
```

- [ ] **Step 5: Update all four `.ts` files**

In each `.ts` file, replace `styles: [...]` with the corresponding `styleUrl:`.

In `contributors.component.ts`, replace `style="color:#009688"` with `class="icon-teal"` and `style="color:#673ab7"` with `class="icon-purple"` in the template.

In `non-contributors.component.ts`, replace `style="color:#ff9800"` with `class="icon-warning-alt"` in the template.

- [ ] **Step 6: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 7: Commit**

```bash
git add src/app/features/cotisations/
git commit -m "refactor: extract styles for cotisations components"
```

---

### Task 8: Extract styles — comptes-rendus (list, form, detail)

**Files:**
- Create: `src/app/features/comptes-rendus/comptes-rendus-list.component.scss`
- Create: `src/app/features/comptes-rendus/compte-rendu-form.component.scss`
- Create: `src/app/features/comptes-rendus/compte-rendu-detail.component.scss`
- Modify: corresponding `.ts` files

- [ ] **Step 1: Create `comptes-rendus-list.component.scss`**

Create `src/app/features/comptes-rendus/comptes-rendus-list.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.header h1 { margin: 0; }
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-field { flex: 1; min-width: 240px; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.table-container { overflow: auto; background: white; border-radius: 4px; }
table { width: 100%; }
.link { color: $color-primary; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }
.actions-col { width: 140px; text-align: right; }
.no-data { text-align: center; padding: 2rem; color: $color-text-muted; }
.summary { margin-top: 0.75rem; color: $color-text-label; font-size: 0.9rem; }
.muted { color: $color-text-muted; font-style: italic; }
.projet-link { color: $color-primary; }

.mobile-sort { margin-bottom: 1rem; }
.sort-field { width: 100%; max-width: 320px; }
.cards-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.cr-card { padding: 1rem; cursor: pointer; }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.card-header strong { font-size: 1rem; }
.card-date { color: $color-text-muted; font-size: 0.85rem; }
.card-body { display: flex; flex-direction: column; gap: 0.4rem; }
.card-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: $color-text-secondary;
}
.card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: $color-text-muted; }
.card-preview {
  color: $color-text-label;
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
  line-height: 1.4;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid $color-divider;
}
.empty-card { padding: 2rem; text-align: center; color: $color-text-muted; font-style: italic; }
```

- [ ] **Step 2: Create `compte-rendu-form.component.scss`**

Create `src/app/features/comptes-rendus/compte-rendu-form.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.header h1 { margin: 0; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.form-card { padding: 2rem; max-width: 1000px; }
.section-title {
  margin: 1.5rem 0 1rem;
  color: $color-primary;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.section-title:first-child { margin-top: 0; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}
.full { grid-column: 1 / -1; width: 100%; }
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid $color-border-light;
}
.warn { color: $color-warning !important; font-weight: 500; }
.quill-wrapper {
  width: 100%;
  margin-bottom: 1rem;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
  overflow: hidden;
}
.quill-wrapper ::ng-deep quill-editor { display: block; }
.quill-wrapper ::ng-deep .ql-container { min-height: 250px; }
.quill-wrapper ::ng-deep .ql-editor { min-height: 250px; }
.quill-wrapper:focus-within { border-color: $color-primary; }
.quill-wrapper.invalid { border-color: $color-error-bright; }
.quill-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: $color-text-muted;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.quill-error { color: $color-error-bright; font-weight: 500; }
.quill-count { margin-left: auto; }
```

- [ ] **Step 3: Create `compte-rendu-detail.component.scss`**

Create `src/app/features/comptes-rendus/compte-rendu-detail.component.scss`:

```scss
@use '../../../styles/variables' as *;

.header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.header h1 { margin: 0; flex: 1; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.detail-card { padding: 2rem; }
.cr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $color-border-light;
}
.cr-header h2 { margin: 0; font-size: 1.5rem; }
.cr-id {
  background: $color-primary-light;
  color: $color-primary;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.field { display: flex; align-items: center; gap: 0.75rem; }
.field mat-icon { color: $color-primary; }
.field label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: $color-text-muted;
  letter-spacing: 0.05em;
  display: block;
}
.field span { font-size: 1rem; }
.projet-link {
  color: $color-primary;
  text-decoration: none;
  font-weight: 500;
}
.projet-link:hover { text-decoration: underline; }
.muted { color: $color-text-muted; font-style: italic; }
.section-title {
  margin: 0 0 1rem;
  color: $color-primary;
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.content {
  background: $color-bg-card;
  padding: 1.5rem;
  border-radius: 4px;
  line-height: 1.6;
  font-size: 1rem;
  color: $color-text-dark;
  border-left: 3px solid $color-primary;
}
.content h1, .content h2, .content h3 { margin: 0.5rem 0; }
.content ul, .content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
.content p { margin: 0.25rem 0; }
.meta-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $color-border-light;
  display: flex;
  gap: 2rem;
  color: $color-text-muted;
  font-size: 0.85rem;
  flex-wrap: wrap;
}
```

- [ ] **Step 4: Update all three `.ts` files**

In each `.ts` file, replace `styles: [...]` with the corresponding `styleUrl:`.

- [ ] **Step 5: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add src/app/features/comptes-rendus/
git commit -m "refactor: extract styles for comptes-rendus components"
```

---

### Task 9: Extract styles — historique

**Files:**
- Create: `src/app/features/historique/historique.component.scss`
- Modify: `src/app/features/historique/historique.component.ts`

- [ ] **Step 1: Create `historique.component.scss`**

Create `src/app/features/historique/historique.component.scss`:

```scss
@use '../../../styles/variables' as *;

h1 { margin-bottom: 1.5rem; }
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.search-field { flex: 1; min-width: 280px; }
.loading { display: flex; justify-content: center; padding: 4rem; }
.entries { display: block; margin-bottom: 1rem; }
mat-expansion-panel { margin-bottom: 4px; }
mat-panel-title { gap: 1rem; align-items: center; }
mat-panel-description { justify-content: flex-end; gap: 1rem; }
.badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  color: white;
}
.badge-create { background: $color-success; }
.badge-update { background: $color-info; }
.badge-delete { background: $color-error-bright; }
.entity { font-weight: 500; }
.entity-id { color: $color-text-label; font-size: 0.9rem; }
.user { color: $color-text-secondary; }
.time { color: $color-text-muted; font-size: 0.85rem; }
.details {
  background: $color-bg-hover;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  max-height: 400px;
  overflow: auto;
  margin: 0;
}
.empty { color: $color-text-muted; font-style: italic; text-align: center; padding: 2rem; }
```

- [ ] **Step 2: Update `historique.component.ts`**

Replace `styles: [...]` with:

```typescript
styleUrl: './historique.component.scss'
```

- [ ] **Step 3: Verify build**

Run: `ng build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit**

```bash
git add src/app/features/historique/
git commit -m "refactor: extract styles for historique component"
```

---

### Task 10: Final verification

- [ ] **Step 1: Full build**

Run: `ng build`
Expected: BUILD SUCCESSFUL with no warnings related to styles

- [ ] **Step 2: Verify no remaining hardcoded colors in component `.ts` files**

Run: `grep -rn "#[0-9a-fA-F]\{3,6\}" src/app/ --include="*.ts"`
Expected: No matches in `styles:` blocks (some may remain in TypeScript logic, which is fine)

- [ ] **Step 3: Verify all SCSS files import variables**

Run: `grep -rL "@use.*variables" src/app/ --include="*.scss"`
Expected: No component SCSS files missing the import (only `_variables.scss` itself)
