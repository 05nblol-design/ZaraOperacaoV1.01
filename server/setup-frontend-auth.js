const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('utils/logger');

const prisma = new PrismaClient();
const JWT_SECRET = 'zara-jwt-secret-key-2024';

async function setupFrontendAuth() {
  try {
    // Buscar usuário Lucas
    const user = await prisma.user.findFirst({
      where: { email: 'lucas.salviano@hotmail.com' }
    });
    
    if (!user) {
      logger.info('❌ Usuário Lucas não encontrado');
      return;
    }
    
    logger.info('👤 Usuário encontrado:', {);
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    // Gerar token
    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    logger.info('\n🔑 Token gerado:');
    logger.info(token);
    
    logger.info('\n📋 Instruções para configurar no frontend:');
    logger.info('1. Abra o DevTools do navegador (F12)');
    logger.info('2. Vá para a aba Console');
    logger.info('3. Execute os seguintes comandos:');
    logger.info('');
    logger.info(`localStorage.setItem('token', '${token}');`););
    logger.info(`localStorage.setItem('user', '${JSON.stringify({);
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })}');`);
    logger.info('');
    logger.info('4. Recarregue a página (F5)');
    logger.info('');
    logger.info('✅ Após isso, todos os erros de autenticação devem ser resolvidos!');
    
  } catch (error) {
    logger.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFrontendAuth();