# Etapa 1: Construcción
FROM node:20-alpine as builder

WORKDIR /app

# Copia los archivos package.json y package-lock.json (o yarn.lock)
# para aprovechar la caché de Docker. Si no cambian, los próximos pasos
# de instalación de dependencias serán más rápidos.
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación para producción
# Asegúrate de que tu package.json tenga un script 'build' que use Vite
RUN npm run build

# Etapa 2: Servir la aplicación
# Usamos una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:stable-alpine as server

# Copia los archivos de construcción desde la etapa 'builder'
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia una configuración personalizada de Nginx (opcional)
# Si necesitas una configuración específica de Nginx, descomenta las siguientes líneas
# y asegúrate de tener un archivo nginx.conf en la raíz de tu proyecto
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto en el que Nginx escuchará (por defecto es el 80)
EXPOSE 80

# Comando para iniciar Nginx y servir la aplicación
CMD ["nginx", "-g", "daemon off;"]