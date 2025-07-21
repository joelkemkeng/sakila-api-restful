-- Garantir que l'utilisateur root a tous les droits nécessaires
-- Ce script s'exécutera après la création de la base et son initialisation

-- Accorder tous les privilèges sur la base Sakila à l'utilisateur root (ne provoque pas d'erreur si l'utilisateur n'existe pas)
GRANT ALL PRIVILEGES ON sakila.* TO 'root'@'%' ;

-- S'assurer que les privilèges sont appliqués immédiatement
FLUSH PRIVILEGES;

-- Table témoin pour healthcheck (fin d'init)
CREATE TABLE IF NOT EXISTS sakila.init_done (id INT PRIMARY KEY);
INSERT IGNORE INTO sakila.init_done (id) VALUES (1);
