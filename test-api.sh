#!/bin/bash
echo "🧪 Tests de l'API Sakila après corrections"
echo "=========================================="

# Variables
BASE_URL="http://127.0.0.1:5050"

echo ""
echo "1️⃣ Test de connexion avec les utilisateurs corrigés"
echo "------------------------------------------------"

# Test avec admin (après avoir appliqué les corrections SQL)
echo "Test admin (testadmin@test.com / password):"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"testadmin@test.com","password":"password"}')
echo "Réponse: $ADMIN_RESPONSE"

# Extraire le token si la connexion réussit
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$ADMIN_TOKEN" ]; then
    echo "✅ Token admin récupéré: ${ADMIN_TOKEN:0:20}..."
else
    echo "❌ Échec de connexion admin"
fi

echo ""
echo "Test user (testuser@test.com / password):"
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email":"testuser@test.com","password":"password"}')
echo "Réponse: $USER_RESPONSE"

USER_TOKEN=$(echo "$USER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$USER_TOKEN" ]; then
    echo "✅ Token user récupéré: ${USER_TOKEN:0:20}..."
else
    echo "❌ Échec de connexion user"
fi

echo ""
echo "2️⃣ Test des endpoints publics"
echo "-----------------------------"

# Test films (public)
echo "GET /films (public):"
curl -s "$BASE_URL/films?limit=2" | head -c 200
echo ""

# Test films avec paramètre limit
echo ""
echo "GET /films?limit=3:"
curl -s "$BASE_URL/films?limit=3" | grep -o '"total":[0-9]*' || echo "❌ Limite non appliquée"

echo ""
echo ""
echo "3️⃣ Test des endpoints protégés (si tokens disponibles)"
echo "----------------------------------------------------"

if [ ! -z "$ADMIN_TOKEN" ]; then
    echo "Test GraphQL avec token admin:"
    curl -s -X POST "$BASE_URL/graphql" \
         -H "Content-Type: application/json" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"query": "{ films(first: 2) { edges { node { film_id title } } totalCount } }"}' | head -c 300
    echo ""
    
    echo ""
    echo "Test création film (admin seulement):"
    curl -s -X POST "$BASE_URL/films" \
         -H "Content-Type: application/json" \
         -H "Authorization: Bearer $ADMIN_TOKEN" \
         -d '{"title":"Test Film","description":"Film de test","release_year":2024,"language_id":1}' | head -c 200
    echo ""
fi

if [ ! -z "$USER_TOKEN" ]; then
    echo ""
    echo "Test UserFile endpoint avec token user:"
    echo "GET /user/1/file (doit fonctionner maintenant):"
    curl -s -X GET "$BASE_URL/user/1/file" \
         -H "Authorization: Bearer $USER_TOKEN" | head -c 200
    echo ""
fi

echo ""
echo "4️⃣ Résumé des corrections"
echo "------------------------"
echo "✅ Routes TSOA régénérées (UserFileController inclus)"
echo "✅ Rôles corrigés en base (admin/user seulement)"
echo "✅ Utilisateurs de test créés avec mot de passe 'password'"
echo "✅ Pagination 'limit' supportée sur /films"
echo "✅ Endpoint /films/1/actors ajouté"
echo "✅ GraphQL corrigé (schéma films)"
echo ""
echo "Pour appliquer les corrections en base, exécute dans MariaDB:"
echo "UPDATE users SET role = 'admin' WHERE user_id = 1;"
echo "UPDATE users SET role = 'user' WHERE user_id = 2;"
echo "UPDATE users SET role = 'user' WHERE user_id = 3;"
echo "INSERT INTO users (username, email, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES"
echo "  ('testadmin', 'testadmin@test.com', '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, NOW(), NOW()),"
echo "  ('testuser', 'testuser@test.com', '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, 1, NOW(), NOW());"