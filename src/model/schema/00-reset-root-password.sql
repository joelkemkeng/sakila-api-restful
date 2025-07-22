-- Script pour forcer le mot de passe root à 'root'
-- Ce script s'exécute en premier pour MariaDB

-- Créer l'utilisateur root avec le mot de passe correct si il n'existe pas
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'root';
-- Changer le mot de passe de root pour localhost et %
SET PASSWORD FOR 'root'@'localhost' = PASSWORD('root');
SET PASSWORD FOR 'root'@'%' = PASSWORD('root');
-- Donner tous les privilèges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;