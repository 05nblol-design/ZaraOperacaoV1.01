const jwt = require('jsonwebtoken');
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
    
    // Gerar token JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('\n=== TOKEN JWT GERADO ===');
    console.log(token);
    console.log('\n=== SCRIPT PARA CONFIGURAR NO FRONTEND ===');
    console.log(`localStorage.setItem('token', '${token}');`);
    console.log(`localStorage.setItem('user', JSON.stringify(${JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    })}));`);
    console.log('\nCopie e cole os comandos acima no console do navegador (F12) na página do frontend.');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();