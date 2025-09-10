# Dockerfile ultra-simples para Railway
FROM node:18-alpine

# Instalar dependências básicas
RUN apk add --no-cache curl

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do servidor
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Gerar Prisma client
RUN npx prisma generate

# Copiar código fonte
COPY server/ .

# Expor porta
EXPOSE 5000

# Iniciar aplicação
CMD ["npm", "start"]