# Railway-optimized Dockerfile for ZARA system
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache curl git openssl openssl-dev libc6-compat

# Set working directory
WORKDIR /app

# Copy server files
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Copy server source code
COPY server/ .

# Remover criação de diretórios uploads para evitar problemas de volume no Railway

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]