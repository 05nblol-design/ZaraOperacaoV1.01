const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('📊 PostgreSQL conectado via Prisma');
    
    // Testar a conexão
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Conexão com PostgreSQL testada com sucesso');
    
  } catch (error) {
    logger.error('❌ Erro ao conectar PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('🔌 PostgreSQL desconectado');
});

module.exports = { connectDB, prisma };