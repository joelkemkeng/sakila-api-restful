/* Désactiver les vérifications de clés étrangères pour l'initialisation */
SET FOREIGN_KEY_CHECKS = 0;
/* Sélectionner la base de données */
USE sakila;
/* Tables pour la gestion des utilisateurs et des rôles */
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) DEFAULT NULL,
    role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMP NULL DEFAULT NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    refresh_token VARCHAR(255) DEFAULT NULL,
    refresh_token_expires TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
CREATE OR REPLACE VIEW user AS SELECT * FROM users;
/* Table pour la journalisation des accès */
DROP TABLE IF EXISTS access_logs;
CREATE TABLE access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action ENUM(
        'login',
        'logout',
        'failed_login',
        'password_reset',
        'token_refresh'
    ) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/* Table pour stocker les fichiers des utilisateurs */
DROP TABLE IF EXISTS user_files;
CREATE TABLE user_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/* Table pour stocker les couvertures des films */
DROP TABLE IF EXISTS film_covers;
CREATE TABLE film_covers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    film_id SMALLINT UNSIGNED NOT NULL,
    cover_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) DEFAULT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES film(film_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/* Table pour les tokens de rafraîchissement (doit être créée après staff et customer) */
DROP TABLE IF EXISTS refresh_tokens;
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    staff_id TINYINT UNSIGNED NULL,
    customer_id SMALLINT UNSIGNED NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/* Insérer quelques utilisateurs dans la table users */
INSERT INTO users (username, email, password_hash, role)
VALUES (
        'admin',
        'admin@mail.com',
        '$2b$10$9aOzKpJpeYObL19N70bASeOi8pcYWrwzK5YtzwlS/a1cXFdVHzXcS',
        'admin'
    ),
    (
        'staff',
        'staff@mail.com',
        '$2b$10$pNx.A5HbmMnP5LjzuXiXJuzIJcU8OBgc2kyYJdKSS1mIDFzMR17xO',
        'staff'
    ),
    (
        'customer',
        'customer@mail.com',
        '$2b$10$P.dO5r5zkiy.HIZ/Uye1E.XBSqEi6.u4i95.jT8PnCnBVcVoQSF7y',
        'customer'
    );
/* Réactiver les vérifications de clés étrangères */
SET FOREIGN_KEY_CHECKS = 1;