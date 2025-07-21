FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Compiler le TypeScript
RUN npm run compile

# Exposer le port de l'API
EXPOSE 5050

# Script de démarrage qui attend que MySQL soit prêt puis initialise la BD
CMD ["node", "--host", "0.0.0.0", "build/server.js"]
