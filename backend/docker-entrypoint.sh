#!/bin/bash
set -e

php artisan config:cache
php artisan route:cache
php artisan migrate --force

# Utilise le port dynamique fourni par Railway
PORT=${PORT:-8080}

php artisan serve --host=0.0.0.0 --port=$PORT