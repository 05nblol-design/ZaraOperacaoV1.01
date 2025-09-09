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

async function createAdminUser() {
  try {
    console.log('🔗 Conectando ao banco PostgreSQL...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se usuário admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@zara.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nome:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      return;
    }
    
    // Criar hash da senha
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('🔐 Criando usuário administrador...');
    
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@zara.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email: admin@zara.com');
    console.log('🔑 Senha: admin123');
    console.log('👤 Nome:', adminUser.name);
    console.log('🆔 ID:', adminUser.id);
    console.log('🔑 Role:', adminUser.role);
    
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log('\n👥 Todos os usuários cadastrados:');
    allUsers.forEach((user, index) => {
      const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
      console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Ativo' : 'Inativo'}`);
    });
    
    console.log('\n🎯 CREDENCIAIS DISPONÍVEIS PARA TESTE:');
    console.log('\n👑 ADMINISTRADOR:');
    console.log('📧 Email: admin@zara.com');
    console.log('🔑 Senha: admin123');
    console.log('\n👤 OPERADOR:');
    console.log('📧 Email: demo@zara.com');
    console.log('🔑 Senha: demo123');
    console.log('\n✅ Usuários prontos para testes no frontend!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    
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
createAdminUser()
  .then(() => {
    console.log('\n🏁 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });