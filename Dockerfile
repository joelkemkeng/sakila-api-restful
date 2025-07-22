FROM node:18-alpine

WORKDIR /app

# Installer le client MySQL/MariaDB pour le script d'attente
RUN apk add --no-cache mysql-client

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Compiler le TypeScript
RUN npm run compile

# Ajouter le script d'attente et d'init de la base
COPY wait-db-and-init.sh /wait-db-and-init.sh
RUN chmod +x /wait-db-and-init.sh

# Exposer le port de l'API
EXPOSE 5050

# Script de démarrage qui attend que MySQL soit prêt puis initialise la BD
CMD ["/wait-db-and-init.sh"]
