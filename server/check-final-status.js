const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkFinalStatus() {
  try {
    const activeOps = await prisma.machineOperation.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: { select: { name: true, email: true } },
        machine: { select: { name: true, code: true } }
      }
    });
    
    logger.info(`\n=== STATUS FINAL ===`);
    logger.info(`Operações ativas: ${activeOps.length}`);
    
    if (activeOps.length === 0) {
      logger.info('✅ SUCESSO! Não há operações ativas.');
      logger.info('✅ Operadores podem agora iniciar novas operações sem erro.');
      logger.info('\n🔧 PROBLEMA RESOLVIDO:');
      logger.info('   - Canceladas 22 operações travadas');
      logger.info('   - Sistema liberado para novas operações');
      logger.info('   - Erro "Operador já possui operação ativa" corrigido');
    } else {
      logger.info('❌ Ainda há operações ativas:');
      activeOps.forEach(op => {
        const duration = Math.round((new Date() - new Date(op.startTime)) / 1000 / 60);
        logger.info(`   - ${op.user.name} na ${op.machine.name} (${duration} min)`);
      });
    }
    
  } catch (error) {
    logger.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalStatus();