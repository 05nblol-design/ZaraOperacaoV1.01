const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function checkRecentNotifications() {
  try {
    logger.info('🔍 Verificando notificações recentes...');
    
    // Buscar as 10 notificações mais recentes
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });
    
    logger.info(`📊 Total de notificações encontradas: ${notifications.length}`);
    
    if (notifications.length > 0) {
      logger.info('\n📋 Notificações recentes:');
      notifications.forEach((notif, index) => {
        const createdAt = new Date(notif.createdAt).toLocaleString('pt-BR');
        logger.info(`\n${index + 1}. ID: ${notif.id}`);
        logger.info(`   Tipo: ${notif.type}`);
        logger.info(`   Título: ${notif.title}`);
        logger.info(`   Mensagem: ${notif.message}`);
        logger.info(`   Usuário: ${notif.user?.name} (${notif.user?.role})`);
        logger.info(`   Lida: ${notif.read ? 'Sim' : 'Não'}`);
        logger.info(`   Criada: ${createdAt}`);
        
        if (notif.metadata) {
          try {
            const metadata = JSON.parse(notif.metadata);
            logger.info(`   Metadata:`, metadata);
          } catch (e) {
            logger.info(`   Metadata (raw): ${notif.metadata}`);
          }
        }
      });
    } else {
      logger.info('❌ Nenhuma notificação encontrada!');
    }
    
    // Verificar notificações por usuário específico
    logger.info('\n👥 Verificando notificações por usuário:');
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['MANAGER', 'LEADER', 'ADMIN']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        role: true
      }
    });
    
    for (const user of users) {
      const userNotifications = await prisma.notification.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      logger.info(`\n${user.name} (${user.role}) - ID: ${user.id}`);
      logger.info(`   Total de notificações: ${userNotifications.length}`);
      
      if (userNotifications.length > 0) {
        userNotifications.forEach((notif, index) => {
          const createdAt = new Date(notif.createdAt).toLocaleString('pt-BR');
          logger.info(`   ${index + 1}. [${notif.type}] ${notif.title} - ${createdAt}`);
        });
      }
    }
    
  } catch (error) {
    logger.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentNotifications();