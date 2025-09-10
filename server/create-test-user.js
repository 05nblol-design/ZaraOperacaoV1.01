const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Verificando usuários existentes...');
    
    const existingUsers = await prisma.user.findMany();
    console.log(`📊 Usuários encontrados: ${existingUsers.length}`);
    
    if (existingUsers.length > 0) {
      console.log('👥 Usuários existentes:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.username} (${user.role}) - ID: ${user.id}`);
      });
    }
    
    // Verificar se já existe usuário teste
    const testUser = await prisma.user.findUnique({
      where: { email: 'teste@zara.com' }
    });
    
    if (testUser) {
      console.log('✅ Usuário teste já existe!');
      console.log(`   Email: teste@zara.com`);
      console.log(`   Password: 123456`);
      console.log(`   Role: ${testUser.role}`);
      return;
    }
    
    // Criar usuário teste
    console.log('🔨 Criando usuário teste...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: 'teste@zara.com',
        password: hashedPassword,
        role: 'MANAGER',
        name: 'Usuário Teste'
      }
    });
    
    console.log('✅ Usuário teste criado com sucesso!');
    console.log(`   Email: teste@zara.com`);
    console.log(`   Password: 123456`);
    console.log(`   Role: ${newUser.role}`);
    console.log(`   ID: ${newUser.id}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();