// Script para corrigir autenticação no frontend
// Execute este código no console do navegador (F12 > Console)

console.log('🔧 Iniciando correção de autenticação...');

// Configurações corretas
const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const CORRECT_JWT_SECRET = 'cFiffgr8I7Z40pqjpXZMDLJzaKjKOVnR';

// Função para fazer login e obter token válido
async function fixAuthentication() {
  try {
    console.log('🔐 Fazendo login...');
    
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@zara.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso!');
    
    // Armazenar token no localStorage
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    
    console.log('💾 Token armazenado no localStorage');
    console.log('👤 Usuário:', loginData.user);
    
    // Testar se o token funciona
    console.log('🧪 Testando token...');
    
    const testResponse = await fetch(`${BACKEND_URL}/api/reports/machine-performance`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('🎉 Token funcionando! Dados recebidos:', testData.data.machines.length, 'máquinas');
      
      // Recarregar a página para aplicar as mudanças
      console.log('🔄 Recarregando página em 2 segundos...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      console.error('❌ Token ainda não funciona:', testResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  }
}

// Executar correção
fixAuthentication();

console.log('📋 INSTRUÇÕES:');
console.log('1. Copie todo este código');
console.log('2. Abra o frontend no navegador');
console.log('3. Pressione F12 para abrir o console');
console.log('4. Cole e execute este código');
console.log('5. Aguarde o reload automático');