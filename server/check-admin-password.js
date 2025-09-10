const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    // Buscar o usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('Usuário admin não encontrado');
      return;
    }
    
    console.log('Usuário admin encontrado:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });
    
    // Verificar se a senha atual é 123456
    const isValidPassword = await bcrypt.compare('123456', adminUser.password);
    console.log('Senha 123456 é válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('\nAtualizando senha para 123456...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      });
      
      console.log('Senha atualizada com sucesso!');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();