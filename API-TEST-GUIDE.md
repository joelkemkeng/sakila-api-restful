# 🧪 Guide de Test API Sakila

## 📋 Corrections Automatiques Appliquées

Après un `docker-compose up`, les corrections suivantes sont automatiquement appliquées :

### ✅ Utilisateurs de Test
- **Admin** : `testadmin@test.com` / `password`
- **User** : `testuser@test.com` / `password`

### ✅ Corrections Techniques
1. Routes TSOA régénérées (UserFileController inclus)
2. Rôles corrigés (admin/user seulement)
3. Pagination 'limit' supportée sur /films
4. Endpoint /films/{id}/actors ajouté
5. GraphQL corrigé (schéma films)

## 🔐 Tests d'Authentification

### Connexion Admin
```bash
curl -X POST "http://127.0.0.1:5050/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"testadmin@test.com","password":"password"}'
```

### Connexion User
```bash
curl -X POST "http://127.0.0.1:5050/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"testuser@test.com","password":"password"}'
```

## 📚 Tests des Endpoints

### Endpoints Publics (sans authentification)
```bash
# Liste des films avec pagination
curl "http://127.0.0.1:5050/films?limit=5"

# Film spécifique
curl "http://127.0.0.1:5050/films/1"

# Acteurs d'un film (NOUVEAU)
curl "http://127.0.0.1:5050/films/1/actors"

# Information système
curl "http://127.0.0.1:5050/"
```

### Endpoints Protégés (avec token JWT)
```bash
# Remplacez YOUR_TOKEN par le token obtenu lors de la connexion

# GraphQL (CORRIGÉ)
curl -X POST "http://127.0.0.1:5050/graphql" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"query": "{ films(first: 3) { edges { node { film_id title description } } totalCount } }"}'

# Fichiers utilisateur (CORRIGÉ)
curl -X GET "http://127.0.0.1:5050/user/1/file" \
     -H "Authorization: Bearer YOUR_TOKEN"

# Création film (admin seulement)
curl -X POST "http://127.0.0.1:5050/films" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"title":"Test Film","description":"Description test","release_year":2024,"language_id":1}'
```

## 🐛 Problèmes Résolus

| Problème Original | Status | Solution |
|------------------|--------|----------|
| ❌ Route /auth/login retourne vide | ✅ **RÉSOLU** | Import JWT corrigé + utilisateurs test |
| ❌ Pagination 'limit' ne fonctionne pas | ✅ **RÉSOLU** | Support ajouté dans FilmController |
| ❌ Route /films/1/actors n'existe pas | ✅ **RÉSOLU** | Endpoint créé et fonctionnel |
| ❌ GraphQL erreur "Cannot query field id" | ✅ **RÉSOLU** | Schéma corrigé (films au lieu de users) |
| ❌ Route /user/{userId}/file en 404 | ✅ **RÉSOLU** | UserFileController créé + routes TSOA |
| ❌ Protection JWT non fonctionnelle | ✅ **RÉSOLU** | Système unifié + rôles corrigés |

## 🚀 Script de Test Automatique

Lancez le script de test complet :
```bash
./test-api.sh
```

## 📊 Endpoints Disponibles

### 🔓 Publics
- `GET /` - Informations système
- `GET /status` - Statut API  
- `GET /metrics` - Métriques
- `GET /films` - Liste films (pagination)
- `GET /films/{id}` - Film par ID
- `GET /films/{id}/actors` - Acteurs d'un film
- `GET /actors` - Liste acteurs
- `GET /actors/{id}` - Acteur par ID
- `GET /actors/{id}/films` - Films d'un acteur

### 🔐 Authentifiés
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/renew` - Renouvellement token
- `GET /auth/verify` - Vérification token
- `POST /auth/logout` - Déconnexion

### 👤 User/Admin
- `POST /graphql` - Requêtes GraphQL
- `GET /user/{userId}/file` - Liste fichiers utilisateur
- `PUT /user/{userId}/file` - Upload fichier
- `GET /user/{userId}/file/{fileId}` - Télécharger fichier
- `GET /films/{filmId}/cover` - Image de couverture

### 🔒 Admin Seulement  
- `POST /films` - Créer film
- `PUT /films/{id}` - Modifier film
- `DELETE /films/{id}` - Supprimer film
- `POST /actors` - Créer acteur
- `PUT /actors/{id}` - Modifier acteur
- `DELETE /actors/{id}` - Supprimer acteur
- `POST /films/{filmId}/cover` - Upload couverture
- `DELETE /films/{filmId}/cover` - Supprimer couverture

## 🔧 Développement

Pour appliquer manuellement les corrections (si nécessaire) :
```sql
-- Correction des rôles
UPDATE users SET role = 'admin' WHERE user_id = 1;
UPDATE users SET role = 'user' WHERE user_id = 2;  
UPDATE users SET role = 'user' WHERE user_id = 3;

-- Création utilisateurs de test
INSERT IGNORE INTO users (username, email, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES
  ('testadmin', 'testadmin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, NOW(), NOW()),
  ('testuser', 'testuser@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, 1, NOW(), NOW());
```