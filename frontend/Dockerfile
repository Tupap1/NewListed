# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Declaramos ARG antes de cualquier cosa para asegurar que se tome
ARG VITE_API_URL
# Persistimos la variable para el build
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . .

# Imprimimos la variable para verla en los logs de Railway (Depuración)
RUN echo "Building with API URL: $VITE_API_URL"

RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]