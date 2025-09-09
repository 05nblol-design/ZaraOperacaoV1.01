const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const logger = require('utils/logger');
const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    logger.info('🔧 Corrigindo senha do admin...');
    
    // Gerar novo hash para a senha admin123
    const newPassword = await bcrypt.hash('admin123', 12);
    
    // Atualizar o admin
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@zara.com' },
      data: { password: newPassword }
    });
    
    logger.info('✅ Senha do admin atualizada com sucesso!');
    logger.info('Email:', updatedAdmin.email);
    logger.info('Novo hash:', newPassword);
    
    // Testar a nova senha
    const isValid = await bcrypt.compare('admin123', newPassword);
    logger.info('\n🔍 Teste da nova senha:');
    logger.info('Senha válida:', isValid);
    
  } catch (error) {
    logger.error('❌ Erro ao corrigir senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();