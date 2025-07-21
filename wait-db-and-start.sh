#!/bin/sh
set -e

# Attendre que la base MariaDB soit accessible
echo "Attente de la base de données (MariaDB)..."
until mariadb -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_DATABASE;" > /dev/null 2>&1; do
  echo "Base non prête, nouvelle tentative dans 2s..."
  sleep 2
done

echo "La base est accessible, vérification de la présence des tables critiques..."
until mariadb -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1 FROM information_schema.tables WHERE table_schema='$DB_DATABASE' AND table_name='users';" | grep 1 > /dev/null; do
  echo "Tables non prêtes, nouvelle tentative dans 2s..."
  sleep 2
done

echo "Base et tables prêtes, lancement de l'API..."
npm run compile || echo "Erreur de compilation, on continue avec les routes existantes"
npm run server 