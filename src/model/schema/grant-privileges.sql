-- Garantir que l'utilisateur root a tous les droits nécessaires
-- Ce script s'exécutera après la création de la base et son initialisation

-- Accorder tous les privilèges sur la base Sakila à l'utilisateur root
GRANT ALL PRIVILEGES ON sakila.* TO 'root'@'%';

-- S'assurer que les privilèges sont appliqués immédiatement
FLUSH PRIVILEGES;
