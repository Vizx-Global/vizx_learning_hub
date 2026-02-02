# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --include=dev

# Copy source code
COPY . .

# Build the application
# We pass build args for environment variables that Vite needs at build time
ARG VITE_API_BASE_URL=http://localhost:8080

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL


RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Limit worker processes to prevent OOM and use a more robust Nginx configuration for SPA
# Nginx's main config (nginx.conf) typically includes /etc/nginx/conf.d/*.conf inside the http block.
# Therefore, files in conf.d should only contain server blocks or directives that belong inside http.
# To set worker_processes, we need to modify the main nginx.conf or create a new one.
# For simplicity and to ensure worker_processes is set, we'll replace the main nginx.conf.
# This config also includes the default mime.types and enables sendfile for performance.
RUN echo 'worker_processes 1; \
events { \
    worker_connections 1024; \
} \
http { \
    include /etc/nginx/mime.types; \
    sendfile on; \
    server { \
        listen 80; \
        listen [::]:80; \
        server_name localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        location /health { \
            access_log off; \
            return 200 "healthy\n"; \
        } \
    } \
}' > /etc/nginx/nginx.conf

# Remove the default config file in conf.d as we've replaced the main nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# Copy build files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# The default nginx:alpine entrypoint handles the nginx command
CMD ["nginx", "-g", "daemon off;"]
