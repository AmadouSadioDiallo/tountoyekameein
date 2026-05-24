# Configuration du Google Sheet — V5

## Onglets requis : 6

- `Persons` (19 colonnes)
- `Projets` (9 colonnes)
- `Cotisations` (9 colonnes)
- `ComptesRendus` (9 colonnes) ⭐ NOUVEAU
- `Users` (3 colonnes)
- `Historique` (6 colonnes)

## Structure des onglets

### Persons (19 colonnes)
```
id	civilite	nom	prenom	email	telephone	dateNaissance	villeNaissance	paysNaissance	nomPere	nomMere	adresse	ville	pays	statut	notes	dateCreation	dateModif	supprime
```

### Projets (9 colonnes)
```
id	nom	description	coutEstime	statut	archive	dateCreation	dateModif	supprime
```

### Cotisations (9 colonnes)
```
id	personId	projetId	montant	date	modePaiement	periode	notes	supprime
```

### ComptesRendus (9 colonnes) ⭐ NOUVEAU
```
id	nomReunion	date	lieu	redacteur	contenu	dateCreation	dateModif	supprime
```

### Users (3 colonnes)
```
email	role	actif
```

### Historique (6 colonnes)
```
timestamp	userEmail	action	entity	entityId	details
```
