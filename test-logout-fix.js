// SCRIPT PARA TESTAR E CORRIGIR O PROBLEMA DE LOGOUT
// Execute este código no console do navegador em: https://sistema-zara-frontend.vercel.app

console.log('🔍 DIAGNÓSTICO DO PROBLEMA DE LOGOUT');
console.log('=' .repeat(50));

// 1. Verificar estado atual
console.log('\n📊 Estado atual do sistema:');
console.log('localStorage:', localStorage);
console.log('sessionStorage:', sessionStorage);
console.log('cookies:', document.cookie);

// 2. Verificar se há token ativo
const currentToken = localStorage.getItem('token');
const currentUser = localStorage.getItem('user');
console.log('\n🔑 Dados de autenticação:');
console.log('Token:', currentToken ? 'PRESENTE' : 'AUSENTE');
console.log('User:', currentUser ? 'PRESENTE' : 'AUSENTE');

if (currentToken) {
  console.log('Token value:', currentToken.substring(0, 20) + '...');
}
if (currentUser) {
  try {
    const userData = JSON.parse(currentUser);
    console.log('User data:', userData);
  } catch (e) {
    console.log('User data (raw):', currentUser);
  }
}

// 3. Função para fazer logout completo
window.forceLogout = function() {
  console.log('\n🚪 Executando logout forçado...');
  
  // Limpar localStorage
  const keysToRemove = ['token', 'user', 'refreshToken', 'authState', 'userPreferences'];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`   Removendo ${key} do localStorage`);
      localStorage.removeItem(key);
    }
  });
  
  // Limpar sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    console.log(`   Removendo ${key} do sessionStorage`);
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies de autenticação
  const authCookies = ['auth-token', 'session-id', 'user-session'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  
  console.log('   ✅ Logout completo executado');
  
  // Verificar se ainda há dados
  setTimeout(() => {
    const remainingToken = localStorage.getItem('token');
    const remainingUser = localStorage.getItem('user');
    
    if (!remainingToken && !remainingUser) {
      console.log('   ✅ Dados de autenticação removidos com sucesso');
    } else {
      console.log('   ⚠️ Ainda há dados persistentes:');
      console.log('   Token:', remainingToken);
      console.log('   User:', remainingUser);
    }
  }, 500);
};

// 4. Função para testar login
window.testLogin = async function(email = 'admin@zara.com', password = '123456') {
  console.log('\n🔐 Testando login...');
  
  try {
    const response = await fetch('https://sistema-zara-backend-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Login bem-sucedido');
      console.log('   Token recebido:', data.token ? 'SIM' : 'NÃO');
      console.log('   User recebido:', data.user ? 'SIM' : 'NÃO');
      
      // Salvar dados
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } else {
      console.log('   ❌ Erro no login:', data.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Erro de conexão:', error.message);
    return null;
  }
};

// 5. Função para testar o ciclo completo
window.testLogoutCycle = async function() {
  console.log('\n🔄 TESTANDO CICLO COMPLETO DE LOGIN/LOGOUT');
  console.log('=' .repeat(50));
  
  // Passo 1: Logout forçado
  console.log('\n1️⃣ Fazendo logout forçado...');
  window.forceLogout();
  
  // Passo 2: Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Passo 3: Verificar se realmente saiu
  const tokenAfterLogout = localStorage.getItem('token');
  const userAfterLogout = localStorage.getItem('user');
  
  if (tokenAfterLogout || userAfterLogout) {
    console.log('   ⚠️ PROBLEMA: Dados ainda persistem após logout!');
    console.log('   Token:', tokenAfterLogout);
    console.log('   User:', userAfterLogout);
    return false;
  }
  
  console.log('   ✅ Logout confirmado - sem dados persistentes');
  
  // Passo 4: Tentar fazer login
  console.log('\n2️⃣ Fazendo login de teste...');
  const loginResult = await window.testLogin();
  
  if (!loginResult) {
    console.log('   ❌ Falha no login de teste');
    return false;
  }
  
  // Passo 5: Verificar se o login persistiu
  const tokenAfterLogin = localStorage.getItem('token');
  const userAfterLogin = localStorage.getItem('user');
  
  if (tokenAfterLogin && userAfterLogin) {
    console.log('   ✅ Login confirmado - dados salvos corretamente');
  } else {
    console.log('   ⚠️ PROBLEMA: Login não persistiu corretamente');
    return false;
  }
  
  // Passo 6: Fazer logout novamente
  console.log('\n3️⃣ Fazendo logout final...');
  window.forceLogout();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const finalToken = localStorage.getItem('token');
  const finalUser = localStorage.getItem('user');
  
  if (!finalToken && !finalUser) {
    console.log('   ✅ SUCESSO: Ciclo completo funcionando corretamente!');
    console.log('\n🎉 O problema de logout foi resolvido!');
    return true;
  } else {
    console.log('   ❌ PROBLEMA PERSISTE: Dados ainda existem após logout final');
    console.log('   Token:', finalToken);
    console.log('   User:', finalUser);
    return false;
  }
};

// 6. Instruções para o usuário
console.log('\n📋 COMANDOS DISPONÍVEIS:');
console.log('- forceLogout()     : Fazer logout completo');
console.log('- testLogin()       : Testar login com credenciais padrão');
console.log('- testLogoutCycle() : Testar ciclo completo de login/logout');
console.log('\n💡 RECOMENDAÇÃO:');
console.log('Execute: testLogoutCycle()');
console.log('\nEste comando irá testar todo o fluxo e identificar onde está o problema.');

console.log('\n' + '='.repeat(50));
console.log('🎯 DIAGNÓSTICO CARREGADO - Execute os comandos acima');
console.log('='.repeat(50));