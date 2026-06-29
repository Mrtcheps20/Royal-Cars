# Royal Cars — Admin Panel

## Fichiers
- `login.html` → Page de connexion
- `dashboard.html` → Tableau de bord admin

## Comptes par défaut
| Email | Mot de passe |
|---|---|
| admin@royalcars.cm | royalcars2024 |
| marvel@royalcars.cm | marvel123 |

> Pour changer les identifiants, modifie le tableau `ADMINS` dans `login.html`.

## Déploiement sur Vercel (avec royalcars237.vercel.app)

1. Copie `login.html` et `dashboard.html` dans ton repo GitHub
2. Place-les dans un dossier `/admin/`
3. Push sur GitHub → Vercel déploie automatiquement
4. Accès : `https://royalcars237.vercel.app/admin/login.html`

## Fonctionnalités
- Login sécurisé (session)
- Ajouter / modifier / supprimer des véhicules
- Ajouter / modifier / supprimer des réservations
- Calcul automatique du montant des réservations
- Données sauvegardées dans le navigateur (localStorage)
- Lien direct vers royalcars237.vercel.app
