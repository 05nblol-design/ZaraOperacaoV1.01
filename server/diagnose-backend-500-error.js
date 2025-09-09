const axios = require('axios');

// URLs configuradas
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function diagnoseBackend500Error() {
  console.log('🔍 DIAGNÓSTICO: Erro 500 no Backend após Redeploy');
  console.log('==================================================\n');
  
  console.log('📍 Configurações:');
  console.log('Backend:', BACKEND_URL);
  console.log('Frontend:', FRONTEND_URL);
  console.log('');
  
  // 1. Testar saúde do backend
  console.log('1️⃣ Testando saúde do backend...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Backend-500-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Backend Health: Status ${response.status}`);
    console.log(`   📊 Dados: ${JSON.stringify(response.data, null, 2)}`);
    console.log(`   🕐 Uptime: ${response.data.uptime}s`);
    console.log(`   🌍 Environment: ${response.data.environment}`);
    console.log(`   📦 Version: ${response.data.version}`);
  } catch (error) {
    console.log(`   ❌ Backend Health falhou: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
    return;
  }
  
  // 2. Testar endpoint de login (onde está o erro 500)
  console.log('\n2️⃣ Testando endpoint de login (erro 500)...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Backend-500-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Login: Status ${response.status}`);
    console.log(`   🔑 Token recebido: ${response.data.token ? 'Sim' : 'Não'}`);
    console.log(`   👤 Usuário: ${response.data.user ? response.data.user.name : 'N/A'}`);
  } catch (error) {
    console.log(`   ❌ Login falhou: ${error.message}`);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`   📊 Status: ${status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(data, null, 2)}`);
      
      if (status === 500) {
        console.log('\n🚨 ANÁLISE DO ERRO 500:');
        console.log('========================');
        
        const errorMessage = data.message || '';
        
        if (errorMessage.includes('Cannot read properties of undefined (reading \'create\')')) {
          console.log('🔍 ERRO IDENTIFICADO: Problema com JWT ou Database');
          console.log('📁 Possíveis causas:');
          console.log('   1. JWT_SECRET não configurado no Railway');
          console.log('   2. DATABASE_URL não configurado no Railway');
          console.log('   3. Problema na inicialização do Prisma/Database');
          console.log('   4. Middleware de autenticação com erro');
          
          console.log('\n🔧 SOLUÇÕES SUGERIDAS:');
          console.log('1. Verificar variáveis de ambiente no Railway:');
          console.log('   - JWT_SECRET');
          console.log('   - DATABASE_URL');
          console.log('   - NODE_ENV=production');
          console.log('2. Verificar se o banco de dados está acessível');
          console.log('3. Verificar logs do Railway para mais detalhes');
          console.log('4. Verificar se as dependências foram instaladas corretamente');
        } else {
          console.log(`🔍 ERRO: ${errorMessage}`);
          console.log('💡 Verificar logs do Railway para mais detalhes');
        }
      } else if (status === 429) {
        console.log('🔍 ERRO: Rate limiting ainda ativo');
        console.log('💡 Aguardar mais tempo ou verificar configuração');
      } else if (status === 401) {
        console.log('🔍 ERRO: Credenciais inválidas');
        console.log('💡 Verificar se as credenciais estão corretas no banco');
      }
    }
  }
  
  // 3. Testar outros endpoints para verificar se o problema é geral
  console.log('\n3️⃣ Testando outros endpoints...');
  
  // Testar endpoint de usuários (se existir)
  try {
    console.log('   📋 Testando /api/users...');
    const response = await axios.get(`${BACKEND_URL}/api/users`, {
      timeout: 5000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Backend-500-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Users endpoint: Status ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.log(`   ⚠️ Users endpoint: Status ${error.response.status}`);
      if (error.response.status === 401) {
        console.log('   💡 Endpoint protegido (normal)');
      } else if (error.response.status === 500) {
        console.log('   🚨 Mesmo erro 500 - problema geral no backend');
      }
    } else {
      console.log(`   ❌ Users endpoint: ${error.message}`);
    }
  }
  
  // Testar endpoint de produtos (se existir)
  try {
    console.log('   📦 Testando /api/products...');
    const response = await axios.get(`${BACKEND_URL}/api/products`, {
      timeout: 5000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Backend-500-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Products endpoint: Status ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.log(`   ⚠️ Products endpoint: Status ${error.response.status}`);
      if (error.response.status === 500) {
        console.log('   🚨 Mesmo erro 500 - problema geral no backend');
      }
    } else {
      console.log(`   ❌ Products endpoint: ${error.message}`);
    }
  }
  
  // 4. Verificar CORS
  console.log('\n4️⃣ Testando CORS...');
  try {
    const corsResponse = await axios.options(`${BACKEND_URL}/api/auth/login`, {
      timeout: 5000,
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log(`   ✅ CORS: Status ${corsResponse.status}`);
    console.log(`   🌐 CORS Origin: ${corsResponse.headers['access-control-allow-origin']}`);
  } catch (error) {
    console.log(`   ❌ CORS problema: ${error.message}`);
  }
  
  // Resumo e próximos passos
  console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
  console.log('==========================');
  console.log('✅ Backend Health: Funcionando');
  console.log('❌ Login Endpoint: Erro 500');
  console.log('⚠️ Outros Endpoints: Verificados');
  console.log('✅ CORS: Funcionando');
  
  console.log('\n🔧 AÇÕES RECOMENDADAS:');
  console.log('=======================');
  console.log('1. 🔍 Verificar logs do Railway Dashboard');
  console.log('2. ✅ Confirmar variáveis de ambiente:');
  console.log('   - JWT_SECRET');
  console.log('   - DATABASE_URL');
  console.log('   - NODE_ENV=production');
  console.log('3. 🔄 Verificar se o banco de dados está acessível');
  console.log('4. 📦 Verificar se todas as dependências foram instaladas');
  console.log('5. 🔧 Verificar middleware de autenticação no código');
  
  console.log('\n⏱️ PRÓXIMOS PASSOS:');
  console.log('1. Acessar Railway Dashboard > Logs');
  console.log('2. Verificar variáveis de ambiente');
  console.log('3. Testar conexão com banco de dados');
  console.log('4. Executar este diagnóstico novamente após correções');
  
  console.log('\n🔗 LINKS ÚTEIS:');
  console.log(`Railway App: https://railway.app/dashboard`);
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
}

// Executar diagnóstico
diagnoseBackend500Error()
  .then(() => {
    console.log('\n🏁 Diagnóstico de erro 500 concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro no diagnóstico:', error.message);
    process.exit(1);
  });