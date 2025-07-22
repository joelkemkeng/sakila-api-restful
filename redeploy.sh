#!/bin/bash
set -e

echo "🔄 Redéploiement avec corrections appliquées"
echo "==========================================="

# Arrêt complet
echo "📦 Arrêt des conteneurs..."
sudo docker-compose down --volumes --remove-orphans

# Nettoyage des images (optionnel)
echo "🧹 Nettoyage..."
sudo docker system prune -f

# Reconstruction et redémarrage
echo "🔧 Reconstruction et démarrage..."
sudo docker-compose up -d --build

# Attente et vérification
echo "⏳ Attente du démarrage (30s)..."
sleep 30

echo "📊 Statut des conteneurs:"
sudo docker-compose ps

echo "📋 Logs rapides:"
sudo docker-compose logs --tail=10 dbms
sudo docker-compose logs --tail=10 api

echo "🌐 Test API..."
if curl -f -s http://localhost:5050/info > /dev/null 2>&1; then
    echo "✅ API fonctionnelle !"
    echo "📍 Accès: http://localhost:5050/api-docs"
else
    echo "❌ API non accessible"
    echo "Logs complets:"
    sudo docker-compose logs api
fi