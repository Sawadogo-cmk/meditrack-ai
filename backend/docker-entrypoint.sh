#!/bin/bash
set -e

# Cache de config pour la production
php artisan config:cache
php artisan route:cache

# Migrations automatiques au démarrage
php artisan migrate --force

# Démarre Apache
apache2-foreground