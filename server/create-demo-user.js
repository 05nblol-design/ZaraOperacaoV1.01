const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// URL correta do PostgreSQL no Railway
const DATABASE_URL = 'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@interchange.proxy.rlwy.net:17733/railway';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function createDemoUser() {
  try {
    console.log('🔗 Conectando ao banco PostgreSQL...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se usuário demo já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@zara.com' }
    });
    
    if (existingUser) {
      console.log('⚠️  Usuário demo já existe!');
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nome:', existingUser.name);
      console.log('🔑 Role:', existingUser.role);
      return;
    }
    
    // Criar hash da senha
    const password = 'demo123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Criando usuário de demonstração...');
    
    // Criar usuário demo
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@zara.com',
        password: hashedPassword,
        name: 'Usuário Demo',
        role: 'OPERATOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Usuário demo criado com sucesso!');
    console.log('📧 Email: demo@zara.com');
    console.log('🔑 Senha: demo123');
    console.log('👤 Nome:', demoUser.name);
    console.log('🆔 ID:', demoUser.id);
    console.log('🔑 Role:', demoUser.role);
    
    // Verificar total de usuários
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total de usuários no banco: ${totalUsers}`);
    
    // Listar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log('\n👥 Usuários cadastrados:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
    console.log('\n🎯 CREDENCIAIS DE DEMONSTRAÇÃO:');
    console.log('📧 Email: demo@zara.com');
    console.log('🔑 Senha: demo123');
    console.log('\n✅ Usuário pronto para testes no frontend!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário demo:', error.message);
    
    if (error.code === 'P2002') {
      console.log('⚠️  Usuário com este email já existe!');
    } else if (error.code === 'P2025') {
      console.log('⚠️  Tabela users não encontrada. Execute as migrações primeiro.');
    } else {
      console.error('Detalhes do erro:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada.');
  }
}

// Executar
createDemoUser()
  .then(() => {
    console.log('\n🏁 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });