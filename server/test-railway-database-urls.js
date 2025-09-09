const { PrismaClient } = require('@prisma/client');

// URLs encontradas na documentação do projeto
const databaseUrls = [
  // URL do Railway Config Final
  'postgresql://postgres:RgrXNUzOdLMvOLyEkrDEjcevlHoHqUqV@zara-postgres.railway.internal:5432/railway',
  
  // URL do Database Final Config
  'postgresql://postgres:GNquZiBhCMsFDZbvDTevPkrWFdRyyLQM@postgres.railway.internal:5432/railway',
  
  // URL atual do .env (problemática)
  process.env.DATABASE_URL
];

async function testDatabaseConnection(url, index) {
  if (!url) {
    console.log(`❌ URL ${index + 1}: Não definida`);
    return false;
  }

  console.log(`\n🔍 Testando URL ${index + 1}:`);
  console.log(`📍 ${url.substring(0, 50)}...`);
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: url
        }
      }
    });

    // Teste simples de conexão
    await prisma.$connect();
    console.log(`✅ URL ${index + 1}: Conexão bem-sucedida!`);
    
    // Teste de query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ URL ${index + 1}: Query executada com sucesso`);
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ URL ${index + 1}: Falha na conexão`);
    console.log(`   Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 TESTE DE CONEXÃO COM BANCO DE DADOS RAILWAY');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  
  for (let i = 0; i < databaseUrls.length; i++) {
    const success = await testDatabaseConnection(databaseUrls[i], i);
    if (success) {
      successCount++;
      console.log(`\n🎯 URL FUNCIONAL ENCONTRADA: ${i + 1}`);
      console.log(`📋 Use esta URL no Railway Dashboard:`);
      console.log(`${databaseUrls[i]}`);
      break; // Para no primeiro sucesso
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (successCount === 0) {
    console.log('❌ NENHUMA URL FUNCIONOU');
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verifique se o serviço PostgreSQL está ativo no Railway');
    console.log('2. Copie a DATABASE_URL diretamente do serviço PostgreSQL');
    console.log('3. Configure a URL no serviço Backend do Railway');
    console.log('4. Aguarde o redeploy automático');
  } else {
    console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Copie a URL funcional mostrada acima');
    console.log('2. Acesse Railway Dashboard');
    console.log('3. Vá no serviço Backend → Variables');
    console.log('4. Edite DATABASE_URL com a URL funcional');
    console.log('5. Aguarde o redeploy');
  }
  
  console.log('\n📞 SUPORTE:');
  console.log('- Documentação: DIAGNOSTICO-RAILWAY-DATABASE.md');
  console.log('- Railway Dashboard: https://railway.app/dashboard');
}

main().catch(console.error);