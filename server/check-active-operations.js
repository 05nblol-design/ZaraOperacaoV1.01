const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkActiveOperations() {
  try {
    logger.info('🔧 Verificando operações ativas...'););
    
    const activeOperations = await prisma.machineOperation.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        machine: true,
        user: true
      }
    });
    
    logger.info(`\n📊 Operações ativas encontradas: ${activeOperations.length}`););
    
    if (activeOperations.length === 0) {
      logger.info('❌ Nenhuma operação ativa encontrada'););
      logger.info('💡 O serviço de produção só atualiza dados quando há operações ativas'););
    } else {
      activeOperations.forEach(operation => {
        const duration = Math.floor((new Date() - new Date(operation.startTime)) / (1000 * 60));
        logger.info(`- ${operation.machine.name}: ${operation.user.name}`););
        logger.info(`  Início: ${operation.startTime}`););
        logger.info(`  Duração: ${duration} minutos`););
        logger.info(`  Status: ${operation.status}`););
      });
    }
    
  } catch (error) {
    logger.error('❌ Erro ao verificar operações:', error.message););
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveOperations();