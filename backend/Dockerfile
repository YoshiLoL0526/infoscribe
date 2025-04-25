FROM python:3.11.12-slim

WORKDIR /backend

# Instalar dependencias del sistema primero
RUN apt-get update \
     && apt-get install -y --no-install-recommends \
     build-essential \
     libpq-dev \
     curl \
     && rm -rf /var/lib/apt/lists/*

# Instalar Poetry
RUN pip install poetry

# Copiar solo los archivos necesarios para la instalación
COPY pyproject.toml poetry.lock* ./

# Configurar Poetry para instalar dependencias en el sistema, no en un venv
RUN poetry config virtualenvs.create false \
     && poetry install --no-root --no-interaction

# Copiar el resto del código
COPY . .

EXPOSE 7013

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7013"]