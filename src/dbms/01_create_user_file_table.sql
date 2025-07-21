-- Création de la table user_file pour stocker les fichiers des utilisateurs
-- Cette table est déjà définie dans 01-schema.sql sous le nom de user_files
-- Ce script est conservé pour la compatibilité mais ne crée pas de nouvelle table

-- Vérifier si la table user_files existe déjà
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sakila' AND table_name = 'user_files');

-- Ne créer la table que si elle n'existe pas déjà
SET @sql = IF(@table_exists = 0, 
    'CREATE TABLE IF NOT EXISTS user_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci',
    'SELECT "Table user_files already exists, skipping creation"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
