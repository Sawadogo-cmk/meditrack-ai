FROM php:8.3-apache

# Extensions PHP nécessaires à Laravel
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ⚠️ Corrige le conflit MPM : désactive tous les MPM puis active mpm_prefork
RUN a2dismod mpm_event mpm_worker mpm_itk 2>/dev/null || true \
    && a2enmod mpm_prefork

# Active mod_rewrite (nécessaire pour Laravel)
RUN a2enmod rewrite

# Change le DocumentRoot vers /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

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

# Script de démarrage
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["docker-entrypoint.sh"]