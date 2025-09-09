const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    logger.info('🔔 Verificando notificações no banco de dados...');
    
    // Buscar todas as notificações recentes
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        user: {
          select: {
            name: true,
            role: true,
            email: true
          }
        }
      }
    });
    
    logger.info(`\n📊 Total de notificações encontradas: ${notifications.length}`);
    
    if (notifications.length === 0) {
      logger.info('❌ Nenhuma notificação encontrada no banco');
      return;
    }
    
    logger.info('\n📋 Detalhes das notificações:');
    notifications.forEach((notification, index) => {
      logger.info(`\n${index + 1}. ID: ${notification.id}`);
      logger.info(`   Usuário: ${notification.user?.name || 'N/A'} (${notification.user?.role || 'N/A'})`);
      logger.info(`   Email: ${notification.user?.email || 'N/A'}`);
      logger.info(`   Tipo: ${notification.type}`);
      logger.info(`   Título: ${notification.title}`);
      logger.info(`   Mensagem: ${notification.message}`);
      logger.info(`   Lida: ${notification.read ? 'Sim' : 'Não'}`);
      logger.info(`   Prioridade: ${notification.priority}`);
      logger.info(`   Criada em: ${notification.createdAt}`);
      
      if (notification.metadata) {
        try {
          const metadata = JSON.parse(notification.metadata);
          logger.info(`   Metadata: ${JSON.stringify(metadata, null, 4)}`);
        } catch (e) {
          logger.info(`   Metadata (raw): ${notification.metadata}`);
        }
      }
    });
    
    // Contar por usuário
    logger.info('\n📊 Resumo por usuário:');
    const userCounts = {};
    notifications.forEach(n => {
      const userName = n.user?.name || 'Usuário desconhecido';
      const userRole = n.user?.role || 'Role desconhecida';
      const key = `${userName} (${userRole})`;
      userCounts[key] = (userCounts[key] || 0) + 1;
    });
    
    Object.entries(userCounts).forEach(([user, count]) => {
      logger.info(`   ${user}: ${count} notificações`);
    });
    
    // Contar por tipo
    logger.info('\n📊 Resumo por tipo:');
    const typeCounts = {};
    notifications.forEach(n => {
      typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
    });
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      logger.info(`   ${type}: ${count} notificações`);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao verificar notificações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();