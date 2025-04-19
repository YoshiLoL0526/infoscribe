FROM python:3.11-buster

# 1.1 Establece /app como directorio de trabajo
WORKDIR /app

# 1.2 Copia solo los archivos de definición de dependencias
COPY . .

# 1.3 Instala Poetry y deshabilita la creación de virtualenvs
RUN pip install poetry \
     && poetry config virtualenvs.create false

# 1.4 Instala librerías de sistema necesarias, incluyendo Redis server
RUN apt-get update \
     && apt-get install -y --no-install-recommends \
     build-essential \
     libpq-dev \
     && rm -rf /var/lib/apt/lists/*

# 1.5 Instala únicamente las dependencias de producción
RUN poetry install --no-root

# 1.7 Crea y hace ejecutable un script de inicio
# Este script se encargará de ejecutar el scraper, iniciar Redis y luego Uvicorn.
# Usamos un RUN echo para crear el archivo directamente en el Dockerfile.
# RUN echo '#!/bin/bash' > /backend/start.sh \
#  && echo 'echo "Ejecutando script de scraping (scrape_books.py)..."' >> /backend/start.sh \
#  && echo 'python scrape_books.py' >> /backend/start.sh \
#  && echo 'if [ $? -ne 0 ]; then' >> /backend/start.sh \
#  && echo '  echo "El script de scraping falló! Saliendo."' >> /backend/start.sh \
#  && echo '  exit 1' >> /backend/start.sh \
#  && echo 'fi' >> /backend/start.sh \
#  && echo 'echo "Script de scraping finalizado con éxito."' >> /backend/start.sh \
#  && echo '' >> /backend/start.sh \
#  && echo 'sleep 2' >> /backend/start.sh \
#  && echo 'echo "Iniciando servidor Uvicorn en primer plano..."' >> /backend/start.sh \
#  && echo 'exec uvicorn app.main:app --host 0.0.0.0 --port 8000' >> /backend/start.sh \
#  && echo 'echo "Uvicorn ha terminado (esto no debería verse si Uvicorn inicia correctamente)"' >> /backend/start.sh \
#  && chmod +x /backend/start.sh # Hacemos el script ejecutable

EXPOSE 7013

CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7013"]
