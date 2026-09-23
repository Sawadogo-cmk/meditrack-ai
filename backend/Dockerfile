FROM php:8.3-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Installe Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copie le code
WORKDIR /var/www/html
COPY . .

# Installe les dépendances PHP sans dev
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Permissions Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose le port que Railway attend
EXPOSE 8080

# Script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]