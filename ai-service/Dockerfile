FROM python:3.13-slim

WORKDIR /app

# Dépendances système pour MySQL
RUN apt-get update && apt-get install -y \
    gcc default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copie et installe les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le code
COPY . .

EXPOSE 8001

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}