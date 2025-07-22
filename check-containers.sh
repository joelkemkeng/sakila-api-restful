#!/bin/bash
echo "=== Status des conteneurs ==="
sudo docker-compose ps

echo -e "\n=== Logs MariaDB ==="
sudo docker-compose logs dbms

echo -e "\n=== Logs API ==="
sudo docker-compose logs api

echo -e "\n=== Test connectivité ==="
curl -f -s http://localhost:5050/info || echo "API non accessible"