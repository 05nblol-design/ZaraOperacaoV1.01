const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('📊 PostgreSQL conectado via Prisma');
    
    // Testar a conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com PostgreSQL testada com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao conectar PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 PostgreSQL desconectado');
});

module.exports = { connectDB, prisma };