const { PrismaClient } = require('@prisma/client');
const RealTimeProductionService = require('./services/realTimeProductionService');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function forceProductionUpdate() {
  try {
    logger.info('🔄 Forçando atualização de produção...');
    
    // Criar uma instância do serviço (sem WebSocket para teste)
    const productionService = new RealTimeProductionService(null);
    
    // Executar atualização manual
    await productionService.updateProduction();
    
    logger.info('✅ Atualização de produção concluída');
    
    // Verificar dados atualizados
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const shiftData = await prisma.shiftData.findMany({
      where: {
        shiftDate: {
          gte: today
        }
      },
      include: {
        machine: true,
        operator: true
      }
    });
    
    logger.info('\n📊 Dados de produção após atualização:');
    shiftData.forEach(shift => {
      logger.info(`- ${shift.machine.name}: ${shift.totalProduction} peças (${shift.operator.name})`);
      logger.info(`  Última atualização: ${shift.lastUpdate}`);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao forçar atualização:', error.message);
    logger.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

forceProductionUpdate();