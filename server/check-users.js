const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    logger.info('👥 Verificando usuários no banco de dados...'););
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      },
      orderBy: {
        role: 'asc'
      }
    });
    
    logger.info('\n📋 Usuários encontrados:'););
    users.forEach(user => {
      const status = user.isActive ? '✅ Ativo' : '❌ Inativo';
      logger.info(`ID: ${user.id} | ${user.email} | ${user.name} | ${user.role} | ${status}`););
    });
    
    logger.info('\n📊 Resumo por role:'););
    const roleCount = {};
    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    
    Object.entries(roleCount).forEach(([role, count]) => {
      logger.info(`${role}: ${count} usuário(s)`););
    });
    
    // Verificar se existem usuários com os roles necessários para notificações
    const requiredRoles = ['MANAGER', 'LEADER', 'ADMIN'];
    logger.info('\n🔍 Verificando roles necessários para notificações:'););
    
    requiredRoles.forEach(role => {
      const usersWithRole = users.filter(u => u.role === role && u.isActive);
      if (usersWithRole.length > 0) {
        logger.info(`✅ ${role}: ${usersWithRole.length} usuário(s) ativo(s)`););
        usersWithRole.forEach(user => {
          logger.info(`   - ${user.name} (${user.email})`););
        });
      } else {
        logger.info(`❌ ${role}: Nenhum usuário ativo encontrado`););
      }
    });
    
  } catch (error) {
    logger.error('❌ Erro ao verificar usuários:', error););
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();