#!/bin/bash
set -e

echo "🚀 Test de déploiement automatique Sakila API"
echo "============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Nettoyer l'environnement
echo -e "${YELLOW}📦 Nettoyage de l'environnement...${NC}"
docker-compose down --volumes --remove-orphans 2>/dev/null || true

# Lancer le déploiement
echo -e "${YELLOW}🔧 Lancement du déploiement...${NC}"
docker-compose up -d

# Attendre que tous les services soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 10

# Vérifier le statut des conteneurs
echo -e "${YELLOW}📊 Vérification du statut des conteneurs...${NC}"
docker-compose ps

# Vérifier les logs de l'API
echo -e "${YELLOW}📋 Logs de l'API (30 dernières lignes):${NC}"
docker-compose logs --tail=30 api

# Test de connectivité API
echo -e "${YELLOW}🌐 Test de connectivité API...${NC}"
sleep 5

# Tester l'endpoint de santé
if curl -f -s http://localhost:5050/info >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API accessible sur http://localhost:5050${NC}"
else
    echo -e "${RED}❌ API non accessible${NC}"
    echo "Logs détaillés de l'API:"
    docker-compose logs api
    exit 1
fi

# Tester l'endpoint Swagger
if curl -f -s http://localhost:5050/api-docs >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Documentation Swagger accessible sur http://localhost:5050/api-docs${NC}"
else
    echo -e "${RED}❌ Documentation Swagger non accessible${NC}"
fi

# Tester l'endpoint films
if curl -f -s "http://localhost:5050/films?page=1&pageSize=5" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Endpoint /films fonctionnel${NC}"
else
    echo -e "${RED}❌ Endpoint /films non fonctionnel${NC}"
fi

echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo ""
echo "📍 URLs disponibles:"
echo "   • API: http://localhost:5050"
echo "   • Documentation: http://localhost:5050/api-docs"
echo "   • GraphQL: http://localhost:5050/graphql"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Voir les logs: docker-compose logs -f api"
echo "   • Arrêter: docker-compose down"
echo "   • Redémarrer: docker-compose restart api"