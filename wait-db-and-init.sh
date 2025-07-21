#!/bin/sh
set -e

# Attendre que la base MariaDB soit accessible
echo "Attente de la base de données (MariaDB)..."
until mariadb -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_DATABASE;" > /dev/null 2>&1; do
  echo "Base non prête, nouvelle tentative dans 2s..."
  sleep 2
done

echo "Base accessible. Initialisation de la base de données si nécessaire..."
node db-init.js || { echo "Erreur lors de l'initialisation de la base, arrêt du conteneur."; exit 1; }

echo "Vérification de la présence des tables critiques..."
for table in users film actor; do
  until mariadb -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 FROM information_schema.tables WHERE table_schema='$DB_DATABASE' AND table_name='$table';" | grep 1 > /dev/null; do
    echo "Table $table non prête, nouvelle tentative dans 2s..."
    sleep 2
  done
done

echo "Base et tables prêtes, lancement de l'API..."
npm run compile || echo "Erreur de compilation, on continue avec les routes existantes"
npm run server 