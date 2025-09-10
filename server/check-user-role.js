const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    console.log('🔍 Verificando role do usuário admin@zara.com...');
    
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@zara.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nome:', user.name);
      console.log('Role:', user.role);
      
      // Verificar se o role permite acesso aos endpoints de manager
      const allowedRoles = ['MANAGER', 'ADMIN'];
      const hasAccess = allowedRoles.includes(user.role);
      
      console.log('\n🔐 Acesso aos endpoints de Manager:', hasAccess ? '✅ PERMITIDO' : '❌ NEGADO');
      console.log('Roles permitidas:', allowedRoles.join(', '));
      
    } else {
      console.log('❌ Usuário não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();