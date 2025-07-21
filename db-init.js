const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Script d'initialisation de la base de données
 * À exécuter manuellement ou via npm run init-db
 */
async function initializeDatabase() {
  console.log(' Initialisation de la base de données...');
  
  try {
    // Configuration de la connexion
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true
    };
    
    // Tentatives de connexion
    const MAX_RETRIES = 10;
    let connection;
    let connected = false;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(` Tentative de connexion à MySQL (${MAX_RETRIES - attempt + 1} essais restants)...`);
        connection = await mysql.createConnection(dbConfig);
        connected = true;
        console.log(' Connexion à MySQL établie avec succès');
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          throw new Error(`Impossible de se connecter à MySQL après ${MAX_RETRIES} tentatives: ${err.message}`);
        }
        // Attendre 2 secondes avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!connected) {
      throw new Error('Échec de connexion à MySQL');
    }
    
    // 1. Créer la base de données si elle n'existe pas
    const dbName = process.env.DB_DATABASE || 'sakila';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(` Base de données "${dbName}" créée ou vérifiée`);
    
    // 2. Utiliser la base de données
    await connection.query(`USE ${dbName}`);
    
    // 3. Vérifier si la base de données est vide ou si les données sont absentes
    const [tables] = await connection.query(`SHOW TABLES`);
    
    let needInitialization = tables.length === 0;
    
    // Vérifier si les tables principales contiennent des données
    if (!needInitialization) {
      try {
        // Vérifier si la table film a des données
        const [filmCount] = await connection.query(`SELECT COUNT(*) as count FROM film`);
        if (filmCount[0].count === 0) {
          console.log(` La table film est vide, rechargement des données nécessaire...`);
          needInitialization = true;
        }
      } catch (err) {
        console.log(` Table film non disponible, initialisation complète nécessaire...`);
        needInitialization = true;
      }
    }
    
    if (needInitialization) {
      console.log(` Initialisation des données...`);
      
      // Si les tables existent mais sont vides, exécuter uniquement le script de données
      if (tables.length > 0) {
        console.log(` Structure existante détectée, chargement des données uniquement...`);
        // Exécuter le script de correction pour la table inventory
        await executeScript(connection, path.join(__dirname, 'src/model/schema/00-fix-inventory.sql'));
        // Exécuter le script de schéma pour s'assurer que toutes les tables sont créées
        await executeScript(connection, path.join(__dirname, 'src/model/schema/01-schema.sql'));
        // Exécuter ensuite le script de données
        await executeScript(connection, path.join(__dirname, 'src/model/schema/02-data.sql'));
      } else {
        console.log(` Base de données vide, initialisation complète...`);
        // Chemin des scripts d'initialisation
        const scriptPaths = [
          path.join(__dirname, 'src/model/schema/00-init.sql'),
          path.join(__dirname, 'src/model/schema/00-fix-inventory.sql'),
          path.join(__dirname, 'src/model/schema/01-schema.sql'),
          path.join(__dirname, 'src/model/schema/02-data.sql'),
          path.join(__dirname, 'src/dbms/01_create_user_file_table.sql')
        ];
        
        // Exécuter les scripts dans l'ordre
        for (const scriptPath of scriptPaths) {
          await executeScript(connection, scriptPath);
        }
      }
      
      console.log(` Initialisation complète terminée`);
    } else {
      console.log(` Base de données déjà initialisée avec ${tables.length} tables et données`);
    }
    
    // 4. Vérifier les tables principales
    const [tablesAfterInit] = await connection.query(`SHOW TABLES`);
    
    console.log(` Tables disponibles après initialisation:`);
    for (const tableObj of tablesAfterInit) {
      const tableName = Object.values(tableObj)[0];
      console.log(`   - ${tableName}`);
    }
    
    // 5. Vérifier le nombre d'enregistrements dans la table film
    try {
      const [filmCount] = await connection.query(`SELECT COUNT(*) as count FROM film`);
      console.log(` Table film disponible avec ${filmCount[0].count} enregistrements`);
    } catch (err) {
      console.log(` Table film non disponible ou inaccessible`);
    }
    
    // Fermer la connexion
    await connection.end();
    
    console.log(` Initialisation de la base de données terminée`);
    console.log(` L'application peut maintenant démarrer normalement`);
    
  } catch (error) {
    console.error(` Erreur lors de l'initialisation: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Exécute un script SQL à partir d'un fichier
 * Gère les délimiteurs et les procédures stockées
 */
async function executeScript(connection, filePath) {
  try {
    console.log(` Exécution du script: ${path.basename(filePath)}`);
    
    // Lire le contenu du fichier
    const scriptContent = fs.readFileSync(filePath, 'utf8');
    
    // Exécuter le script
    await connection.query(scriptContent);
    
    console.log(` Script ${path.basename(filePath)} exécuté avec succès`);
  } catch (error) {
    console.error(` Erreur lors de l'exécution du script ${path.basename(filePath)}: ${error.message}`);
    throw error;
  }
}

// Exécuter l'initialisation
initializeDatabase().catch(error => {
  console.error(`Erreur fatale: ${error.message}`);
  process.exit(1);
});
