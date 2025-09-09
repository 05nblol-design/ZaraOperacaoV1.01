const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkMachine2History() {
  try {
    logger.info('🔍 Verificando histórico da Máquina 02...'););
    
    // Verificar últimas operações na Máquina 02
    const recentOperations = await prisma.machineOperation.findMany({
      where: {
        machineId: 2
      },
      include: {
        user: true,
        machine: true
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 10
    });
    
    logger.info(`\n📊 Últimas ${recentOperations.length} operações na Máquina 02:`););
    
    if (recentOperations.length === 0) {
      logger.info('   ❌ Nenhuma operação encontrada'););
    } else {
      recentOperations.forEach((op, index) => {
        const duration = op.endTime 
          ? Math.floor((new Date(op.endTime) - new Date(op.startTime)) / (1000 * 60))
          : Math.floor((new Date() - new Date(op.startTime)) / (1000 * 60));
        
        logger.info(`\n   ${index + 1}. Operação ID: ${op.id}`););
        logger.info(`      Usuário: ${op.user.name} (${op.user.email})`););
        logger.info(`      Status: ${op.status}`););
        logger.info(`      Início: ${op.startTime}`););
        logger.info(`      Fim: ${op.endTime || 'Em andamento'}`););
        logger.info(`      Duração: ${duration} minutos`););
        logger.info(`      Notas: ${op.notes || 'Nenhuma'}`););
      });
    }
    
    // Verificar se há operações ACTIVE em outras máquinas
    const allActiveOps = await prisma.machineOperation.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: true,
        machine: true
      }
    });
    
    logger.info(`\n🔧 Operações ativas em todas as máquinas: ${allActiveOps.length}`););
    
    if (allActiveOps.length > 0) {
      allActiveOps.forEach(op => {
        const duration = Math.floor((new Date() - new Date(op.startTime)) / (1000 * 60));
        logger.info(`   - ${op.machine.name}: ${op.user.name} (${duration} min)`););
      });
    }
    
  } catch (error) {
    logger.error('❌ Erro:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkMachine2History();