const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('utils/logger');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    logger.info('🔄 Criando usuários de demonstração...'););

    // Criar usuário líder
    const existingLeader = await prisma.user.findUnique({
      where: { email: 'leader@zara.com' }
    });

    if (!existingLeader) {
      const leaderPassword = await bcrypt.hash('leader123', 12);
      const leader = await prisma.user.create({
        data: {
          name: 'Maria Santos - Líder',
          email: 'leader@zara.com',
          password: leaderPassword,
          role: 'LEADER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logger.info('✅ Líder criado:', leader.email););
    } else {
      logger.info('ℹ️ Líder já existe:', existingLeader.email););
    }

    // Criar usuário gestor
    const existingManager = await prisma.user.findUnique({
      where: { email: 'manager@zara.com' }
    });

    if (!existingManager) {
      const managerPassword = await bcrypt.hash('manager123', 12);
      const manager = await prisma.user.create({
        data: {
          name: 'João Silva - Gestor',
          email: 'manager@zara.com',
          password: managerPassword,
          role: 'MANAGER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logger.info('✅ Gestor criado:', manager.email););
    } else {
      logger.info('ℹ️ Gestor já existe:', existingManager.email););
    }

    // Criar usuário admin se não existir
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zara.com' }
    });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 12);
      const admin = await prisma.user.create({
        data: {
          name: 'Administrador Sistema',
          email: 'admin@zara.com',
          password: adminPassword,
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logger.info('✅ Admin criado:', admin.email););
    } else {
      logger.info('ℹ️ Admin já existe:', existingAdmin.email););
    }

    logger.info('\n📋 Credenciais disponíveis:'););
    logger.info('Admin: admin@zara.com / admin123'););
    logger.info('Gestor: manager@zara.com / manager123'););
    logger.info('Líder: leader@zara.com / leader123'););
    logger.info('Operador (teste): operador@zara.com / 123456'););

  } catch (error) {
    logger.error('❌ Erro ao criar usuários:', error.message););
    
    // Se for erro de transação, tentar abordagem alternativa
    if (error.code === 'P2031') {
      logger.info('\n⚠️ MongoDB não está configurado como replica set.'););
      logger.info('📋 Use as credenciais de teste hardcoded:'););
      logger.info('Operador: operador@zara.com / 123456'););
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();