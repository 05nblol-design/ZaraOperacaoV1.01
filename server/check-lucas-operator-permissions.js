const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkLucasPermissions() {
  logger.info('🔍 Verificando permissões do operador Lucas (ID: 2)...'););
  
  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: 2 },
      select: { id: true, name: true, email: true, role: true }
    });
    
    if (!user) {
      logger.info('❌ Usuário com ID 2 não encontrado'););
      return;
    }
    
    logger.info('👤 Usuário encontrado:', user););
    
    // Verificar permissões de máquina
    const permissions = await prisma.machinePermission.findMany({
      where: { userId: 2 },
      include: {
        machine: {
          select: { id: true, name: true, status: true }
        },
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });
    
    logger.info(`\n📋 Permissões encontradas: ${permissions.length}`););
    
    if (permissions.length === 0) {
      logger.info('❌ PROBLEMA: Operador Lucas não tem permissões de máquina!'););
      logger.info('💡 Solução: Criar permissões para o operador'););
    } else {
      permissions.forEach((p, index) => {
        logger.info(`\n${index + 1}. Máquina: ${p.machine.name} (ID: ${p.machine.id})`););
        logger.info(`   - canOperate: ${p.canOperate}`););
        logger.info(`   - canMaintain: ${p.canMaintain}`););
        logger.info(`   - Status da máquina: ${p.machine.status}`););
        
        if (!p.canOperate) {
          logger.info('   ⚠️  PROBLEMA: canOperate é false!'););
        }
      });
    }
    
    // Verificar todas as máquinas disponíveis
    const allMachines = await prisma.machine.findMany({
      select: { id: true, name: true, status: true }
    });
    
    logger.info(`\n🏭 Total de máquinas no sistema: ${allMachines.length}`););
    allMachines.forEach(m => {
      logger.info(`   - ${m.name} (ID: ${m.id}) - Status: ${m.status}`););
    });
    
  } catch (error) {
    logger.error('❌ Erro ao verificar permissões:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkLucasPermissions();