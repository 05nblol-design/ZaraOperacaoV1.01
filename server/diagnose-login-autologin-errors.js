const axios = require('axios');

// URLs configuradas
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const FRONTEND_URL = 'https://sistema-zara-frontend.vercel.app';

// Credenciais de teste do auto-login
const AUTO_LOGIN_CREDENTIALS = {
  email: 'admin@zara.com',
  password: '123456'
};

// Credenciais de teste válidas
const VALID_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

async function diagnoseLoginErrors() {
  console.log('🔍 DIAGNÓSTICO: Erros de Login e Auto-login');
  console.log('==============================================\n');
  
  console.log('📍 Configurações:');
  console.log('Frontend:', FRONTEND_URL);
  console.log('Backend:', BACKEND_URL);
  console.log('');
  
  const results = {
    backendHealth: null,
    autoLoginTest: null,
    loginTest: null,
    authVerifyTest: null,
    corsTest: null
  };
  
  // 1. Testar saúde do backend
  console.log('1️⃣ Testando saúde do backend...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Zara-Login-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Backend Health: Status ${response.status}`);
    console.log(`   📊 Dados: ${JSON.stringify(response.data)}`);
    results.backendHealth = 'OK';
  } catch (error) {
    console.log(`   ❌ Backend Health: ${error.message}`);
    if (error.response) {
      console.log(`   📊 Status: ${error.response.status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(error.response.data)}`);
    }
    results.backendHealth = 'ERRO';
  }
  
  // 2. Testar auto-login (credenciais do useAuth.jsx)
  console.log('\n2️⃣ Testando auto-login (admin@zara.com / 123456)...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, AUTO_LOGIN_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Zara-Login-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Auto-login: Status ${response.status}`);
    console.log(`   🔑 Token recebido: ${response.data.token ? 'Sim' : 'Não'}`);
    console.log(`   👤 Usuário: ${response.data.user ? response.data.user.name : 'N/A'}`);
    results.autoLoginTest = 'OK';
  } catch (error) {
    console.log(`   ❌ Auto-login falhou: ${error.message}`);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`   📊 Status: ${status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(data)}`);
      
      if (status === 401) {
        console.log(`   🚨 PROBLEMA: Credenciais de auto-login inválidas`);
        console.log(`   💡 SOLUÇÃO: Atualizar credenciais no useAuth.jsx linha 53`);
        results.autoLoginTest = 'CREDENCIAIS_INVALIDAS';
      } else if (status === 429) {
        console.log(`   🚨 PROBLEMA: Rate limiting ainda ativo`);
        results.autoLoginTest = 'RATE_LIMITED';
      } else {
        results.autoLoginTest = 'ERRO';
      }
    } else {
      results.autoLoginTest = 'ERRO_CONEXAO';
    }
  }
  
  // 3. Testar login com credenciais válidas
  console.log('\n3️⃣ Testando login manual (admin@zara.com / admin123)...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, VALID_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'Zara-Login-Diagnostic/1.0'
      }
    });
    console.log(`   ✅ Login manual: Status ${response.status}`);
    console.log(`   🔑 Token recebido: ${response.data.token ? 'Sim' : 'Não'}`);
    console.log(`   👤 Usuário: ${response.data.user ? response.data.user.name : 'N/A'}`);
    results.loginTest = 'OK';
    
    // 4. Testar verificação de token (auth/verify)
    if (response.data.token) {
      console.log('\n4️⃣ Testando verificação de token...');
      try {
        const verifyResponse = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${response.data.token}`,
            'Origin': FRONTEND_URL,
            'User-Agent': 'Zara-Login-Diagnostic/1.0'
          }
        });
        console.log(`   ✅ Verificação de token: Status ${verifyResponse.status}`);
        console.log(`   👤 Dados do usuário: ${JSON.stringify(verifyResponse.data)}`);
        results.authVerifyTest = 'OK';
      } catch (verifyError) {
        console.log(`   ❌ Verificação de token falhou: ${verifyError.message}`);
        if (verifyError.response) {
          console.log(`   📊 Status: ${verifyError.response.status}`);
          console.log(`   📝 Resposta: ${JSON.stringify(verifyError.response.data)}`);
        }
        results.authVerifyTest = 'ERRO';
      }
    }
  } catch (error) {
    console.log(`   ❌ Login manual falhou: ${error.message}`);
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`   📊 Status: ${status}`);
      console.log(`   📝 Resposta: ${JSON.stringify(data)}`);
      
      if (status === 429) {
        console.log(`   🚨 PROBLEMA: Rate limiting ainda ativo`);
        results.loginTest = 'RATE_LIMITED';
      } else {
        results.loginTest = 'ERRO';
      }
    } else {
      results.loginTest = 'ERRO_CONEXAO';
    }
  }
  
  // 5. Testar CORS
  console.log('\n5️⃣ Testando CORS...');
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
    results.corsTest = 'OK';
  } catch (error) {
    console.log(`   ❌ CORS problema: ${error.message}`);
    results.corsTest = 'ERRO';
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('====================');
  console.log(`   1. Backend Health: ${results.backendHealth}`);
  console.log(`   2. Auto-login: ${results.autoLoginTest}`);
  console.log(`   3. Login Manual: ${results.loginTest}`);
  console.log(`   4. Verificação Token: ${results.authVerifyTest}`);
  console.log(`   5. CORS: ${results.corsTest}`);
  
  // Análise e soluções
  console.log('\n🔧 ANÁLISE E SOLUÇÕES:');
  console.log('======================');
  
  if (results.autoLoginTest === 'CREDENCIAIS_INVALIDAS') {
    console.log('\n🚨 ERRO IDENTIFICADO: Auto-login com credenciais inválidas');
    console.log('📁 Arquivo: frontend/src/hooks/useAuth.jsx (linha ~53)');
    console.log('🔧 SOLUÇÃO:');
    console.log('   1. Alterar credenciais de auto-login:');
    console.log('      email: "admin@zara.com"');
    console.log('      password: "admin123" (ao invés de "123456")');
    console.log('   2. Ou desabilitar auto-login em produção');
  }
  
  if (results.loginTest === 'RATE_LIMITED' || results.autoLoginTest === 'RATE_LIMITED') {
    console.log('\n🚨 ERRO IDENTIFICADO: Rate limiting ainda ativo');
    console.log('🔧 SOLUÇÃO: Aguardar redeploy do Railway ou verificar configuração');
  }
  
  if (results.backendHealth === 'ERRO') {
    console.log('\n🚨 ERRO IDENTIFICADO: Backend não está respondendo');
    console.log('🔧 SOLUÇÃO: Verificar status do Railway e configurações');
  }
  
  if (results.authVerifyTest === 'ERRO') {
    console.log('\n🚨 ERRO IDENTIFICADO: Verificação de token falhando');
    console.log('🔧 SOLUÇÃO: Verificar middleware de autenticação no backend');
  }
  
  console.log('\n✅ CREDENCIAIS PARA TESTE:');
  console.log('👤 Admin: admin@zara.com / admin123');
  console.log('👤 Demo: demo@zara.com / demo123');
  
  console.log('\n⏱️ Próximos passos:');
  if (results.autoLoginTest === 'CREDENCIAIS_INVALIDAS') {
    console.log('1. 🔧 Corrigir credenciais de auto-login no frontend');
    console.log('2. 🔄 Testar novamente');
  } else if (results.loginTest === 'OK' && results.autoLoginTest === 'OK') {
    console.log('1. ✅ Sistema funcionando corretamente');
    console.log('2. 🎉 Erros de login resolvidos');
  } else {
    console.log('1. 🔍 Investigar erros específicos identificados');
    console.log('2. 🔧 Aplicar soluções sugeridas');
    console.log('3. 🔄 Executar diagnóstico novamente');
  }
}

// Executar diagnóstico
diagnoseLoginErrors()
  .then(() => {
    console.log('\n🏁 Diagnóstico de login concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro no diagnóstico:', error.message);
    process.exit(1);
  });