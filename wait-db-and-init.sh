#!/bin/sh
set -e

# Attendre que la base MariaDB soit accessible
echo "Attente de la base de données (MariaDB)..."
echo "Configuration: Host=$DB_HOST, User=$DB_USER, Database=$DB_DATABASE"

# Vérification robuste de la connectivité MariaDB
TIMEOUT=180
ELAPSED=0

echo "Test de connectivité MariaDB..."
until mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "ERREUR: Timeout après ${TIMEOUT}s - Impossible de se connecter à MariaDB"
    echo "Vérifiez que le conteneur MariaDB démarre correctement"
    exit 1
  fi
  echo "MariaDB non accessible, nouvelle tentative dans 3s... (${ELAPSED}s/${TIMEOUT}s)"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

echo "Connexion MariaDB établie. Vérification de la base de données..."
ELAPSED=0
until mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_DATABASE; SELECT 1;" > /dev/null 2>&1; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "ERREUR: Timeout après ${TIMEOUT}s - Base de données $DB_DATABASE non accessible"
    exit 1
  fi
  echo "Base $DB_DATABASE non prête, nouvelle tentative dans 3s... (${ELAPSED}s/${TIMEOUT}s)"
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done

echo "Base accessible. Initialisation de la base de données si nécessaire..."
node db-init.js || { echo "Erreur lors de l'initialisation de la base, arrêt du conteneur."; exit 1; }

echo "Vérification de la présence des tables critiques..."
for table in users film actor; do
  until mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 FROM information_schema.tables WHERE table_schema='$DB_DATABASE' AND table_name='$table';" | grep 1 > /dev/null; do
    echo "Table $table non prête, nouvelle tentative dans 2s..."
    sleep 2
  done
  echo "Table $table prête ✓"
done

echo "Application des corrections utilisateurs..."

# Correction des rôles existants pour être compatible avec le système (admin/user seulement)
echo "Correction des rôles utilisateurs..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_DATABASE" -e "
UPDATE users SET role = 'admin' WHERE user_id = 1 AND role != 'admin';
UPDATE users SET role = 'user' WHERE user_id = 2 AND role != 'user';  
UPDATE users SET role = 'user' WHERE user_id = 3 AND role != 'user';
" || echo "Avertissement: Impossible de corriger les rôles existants"

# Création d'utilisateurs de test avec des mots de passe connus (hash pour 'password')
echo "Création des utilisateurs de test..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_DATABASE" -e "
INSERT IGNORE INTO users (username, email, password_hash, role, is_active, email_verified, created_at, updated_at) VALUES
  ('testadmin', 'testadmin@test.com', '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, NOW(), NOW()),
  ('testuser', 'testuser@test.com', '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 1, 1, NOW(), NOW());
" && echo "Utilisateurs de test créés ✓" || echo "Avertissement: Utilisateurs de test déjà existants"

echo "Informations de connexion pour les tests:"
echo "  Admin: testadmin@test.com / password"
echo "  User:  testuser@test.com / password"

echo "Base et tables prêtes, compilation des routes TSOA..."
npm run compile || echo "Erreur de compilation, on continue avec les routes existantes"

echo "Démarrage du serveur API..."
exec npm run server