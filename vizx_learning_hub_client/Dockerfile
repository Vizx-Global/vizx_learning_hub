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

# Copy build files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed for SPA routing
# Create a simple config on the fly
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
