# API Sakila - Documentation

## 📋 Présentation de l'API
L'API Sakila est une interface RESTful permettant d'accéder et de gérer les données du célèbre exemple de base de données Sakila (films, acteurs, locations). Elle implémente une authentification JWT avec différents niveaux d'accès (customer, staff, admin) et offre des fonctionnalités complètes de CRUD.

## 📥 Installation et démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/joelkemkeng/sakila-api-restful.git
cd sakila-api-restful
```

### 2. Démarrer avec Docker Compose
```bash
docker-compose up -d
```

### 3. Attendre le démarrage complet
⚠️ **Important** : Veuillez patienter **2 à 5 minutes** après le lancement de `docker-compose up -d` pour que tous les services se démarrent correctement (base de données, initialisation des données, API).

### 4. Accéder à l'API
Une fois l'attente terminée, l'API sera disponible sur :
**http://localhost:5050/api-docs/**

> **Note** : Si localhost ne fonctionne pas, essayez d'utiliser directement l'adresse IP 127.0.0.1 (http://127.0.0.1:5050/api-docs).

## ✅ Fonctionnalités implémentées
- **Authentification** : Register, Login, Refresh Token, Logout
- **Films** : Liste, Détails, Recherche, Filtrage par catégorie
- **Acteurs** : Liste, Détails, Filmographie
- **Locations** : Création, Historique, Retours
- **Administration** : Gestion des utilisateurs, Rapports, Statistiques
- **Documentation API** : Swagger UI intégré

## 🚀 Commandes Apollo pour tests GraphQL
```bash
# Requêtes de connexion pour obtenir les tokens JWT
# ------------------------------------------------

# Connexion en tant qu'admin
curl -X POST "http://127.0.0.1:5050/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@mail.com","password":"admin123"}'

# Connexion en tant que staff
curl -X POST "http://127.0.0.1:5050/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"staff@mail.com","password":"staff123"}'

# Connexion en tant que customer
curl -X POST "http://127.0.0.1:5050/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"customer@mail.com","password":"customer123"}'

# Requêtes GraphQL
# ---------------

# Requête pour obtenir la liste des films
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" --data '{"query": "{ films { id title description releaseYear } }"}' http://127.0.0.1:5050/graphql

# Requête pour obtenir les détails d'un film
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" --data '{"query": "{ film(id: 1) { title actors { firstName lastName } category { name } } }"}' http://127.0.0.1:5050/graphql

# Mutation pour créer une location
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" --data '{"query": "mutation { createRental(customerId: 1, inventoryId: 1) { rentalId rentalDate } }"}' http://127.0.0.1:5050/graphql
```

## 🔑 Identifiants de test

### Customer
```
Email: customer@mail.com
Password: customer123
```

### Staff
```
Email: staff@mail.com
Password: staff123
```

### Admin
```
Email: admin@mail.com
Password: admin123
```

## 📝 Notes importantes
- Base de données pré-peuplée via `docker-compose`
- Swagger disponible sur `http://localhost:5050/api-docs`
- Journal des erreurs : `logs/error.log`

## 🚨 Dépannage
- Erreurs MySQL : Vérifiez `docker ps` et les logs avec `docker-compose logs mysql`
- Erreurs JWT : Regénérez le secret dans `.env`
- Problèmes de build : `rm -rf node_modules/ && npm install`

## 🧪 Indications de Tests

### Authentification

#### 1. Inscription utilisateur
```bash
curl -X POST http://localhost:5050/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nouvel_utilisateur",
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Réponse attendue:**
```json
{
  "user": {
    "user_id": 4,
    "username": "nouvel_utilisateur",
    "email": "test@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Connexion (obtention du JWT)
```bash
curl -X POST http://localhost:5050/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mail.com",
    "password": "admin123"
  }'
```

### CRUD Films (Admin seulement)

#### 1. Liste des films
```bash
curl -X GET http://localhost:5050/films \
  -H "Authorization: Bearer votre_jwt_token"
```

#### 2. Détails d'un film
```bash
curl -X GET http://localhost:5050/films/1 \
  -H "Authorization: Bearer votre_jwt_token"
```

#### 3. Création d'un film (Admin uniquement)
```bash
curl -X POST http://localhost:5050/films \
  -H "Authorization: Bearer votre_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nouveau Film",
    "description": "Description du film",
    "release_year": 2025,
    "language_id": 1,
    "rental_duration": 3,
    "rental_rate": 4.99,
    "length": 120,
    "replacement_cost": 19.99,
    "rating": "PG-13"
  }'
```

#### 4. Mise à jour d'un film (Admin uniquement)
```bash
curl -X PUT http://localhost:5050/films/1 \
  -H "Authorization: Bearer votre_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Film Mis à Jour",
    "description": "Nouvelle description"
  }'
```

#### 5. Suppression d'un film (Admin uniquement)
```bash
curl -X DELETE http://localhost:5050/films/1 \
  -H "Authorization: Bearer votre_jwt_token"
```

### Gestion des acteurs d'un film

#### 1. Liste des acteurs d'un film
```bash
curl -X GET http://localhost:5050/films/1/actors \
  -H "Authorization: Bearer votre_jwt_token"
```

#### 2. Détails d'un acteur spécifique d'un film
```bash
curl -X GET http://localhost:5050/films/1/actors/1 \
  -H "Authorization: Bearer votre_jwt_token"
```

### Upload d'image de couverture

#### 1. Upload d'une image
```bash
curl -X POST http://localhost:5050/films/1/cover \
  -H "Authorization: Bearer votre_jwt_token" \
  -F "cover=@/chemin/vers/image.jpg"
```

#### 2. Téléchargement d'une image
```bash
curl -X GET http://localhost:5050/films/1/cover \
  -H "Authorization: Bearer votre_jwt_token" \
  -o image_telechargee.jpg
```

### GraphQL (Endpoint public)

#### 1. Liste des films avec leurs acteurs
```bash
curl -X POST http://localhost:5050/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ films { id title description actors { id first_name last_name } } }"
  }'
```

#### 2. Recherche de films par titre
```bash
curl -X POST http://localhost:5050/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ films(search: \"action\") { title description } }"
  }'
```

### Commandes Apollo

#### 1. Liste des films
```graphql
query GetFilms {
  films {
    id
    title
    description
    actors {
      id
      first_name
      last_name
    }
  }
}
```

#### 2. Recherche de films
```graphql
query SearchFilms($searchTerm: String!) {
  films(search: $searchTerm) {
    id
    title
    description
    release_year
    rating
    actors {
      first_name
      last_name
    }
  }
}
```

#### 3. Détails d'un film spécifique
```graphql
query GetFilmById($filmId: ID!) {
  film(id: $filmId) {
    id
    title
    description
    release_year
    language {
      name
    }
    actors {
      first_name
      last_name
    }
    categories {
      name
    }
  }
}
```

## 🔑 Utilisateurs de test

| Username | Email | Mot de passe | Rôle |
|----------|-------|-------------|------|
| admin | admin@mail.com | admin123 | admin |
| staff | staff@mail.com | staff123 | staff |
| customer | customer@mail.com | customer123 | customer |

Ces utilisateurs sont automatiquement créés lors de l'initialisation de la base de données.

## Crédits: Développé par Joel Kemkeng sous licence MIT. 2025

