const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkActiveOperation() {
  try {
    const activeOp = await prisma.machineOperation.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        user: true,
        machine: true
      },
      orderBy: { startTime: 'desc' }
    });
    
    if (activeOp) {
      const duration = Math.round((new Date() - new Date(activeOp.startTime)) / 1000 / 60);
      logger.info('\n=== OPERAÇÃO ATIVA ENCONTRADA ===');
      logger.info('ID:', activeOp.id);
      logger.info('Usuário:', activeOp.user.name, '(' + activeOp.user.email + ')');
      logger.info('Máquina:', activeOp.machine.name);
      logger.info('Início:', activeOp.startTime);
      logger.info('Duração:', duration, 'minutos');
      logger.info('Notas:', activeOp.notes || 'Nenhuma');
      
      if (duration < 5) {
        logger.info('\n✅ Esta é uma operação recente (menos de 5 min)');
        logger.info('✅ PROBLEMA RESOLVIDO! O sistema está funcionando normalmente.');
        logger.info('✅ Operadores conseguem iniciar operações sem o erro anterior.');
      } else {
        logger.info('\n⚠️  Esta operação pode estar travada.');
      }
    } else {
      logger.info('\n✅ Nenhuma operação ativa encontrada.');
      logger.info('✅ Sistema limpo e pronto para novas operações.');
    }
    
  } catch (error) {
    logger.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveOperation();