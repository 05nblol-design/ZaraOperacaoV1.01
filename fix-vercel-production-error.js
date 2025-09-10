
// 🔧 CORREÇÃO PARA PROBLEMAS DE PRODUÇÃO NO VERCEL
// Execute este código no console do navegador

console.log('🔧 Iniciando correção de problemas de produção...');

// 1. Verificar erros de JavaScript
let errorCount = 0;
const originalError = window.onerror;

window.onerror = function(message, source, lineno, colno, error) {
  errorCount++;
  console.error('❌ Erro JavaScript detectado:', {
    message,
    source,
    line: lineno,
    column: colno,
    error
  });
  
  // Se for erro de 'acc is not defined'
  if (message.includes('acc is not defined')) {
    console.log('🎯 Erro "acc is not defined" detectado!');
    console.log('📍 Possível causa: Minificação quebrou parâmetros de função reduce');
    
    // Tentar recarregar componentes específicos
    setTimeout(() => {
      console.log('🔄 Tentando recarregar página...');
      window.location.reload();
    }, 1000);
  }
  
  // Chamar handler original se existir
  if (originalError) {
    return originalError.apply(this, arguments);
  }
  
  return false;
};

// 2. Verificar se React está carregado corretamente
if (typeof React === 'undefined') {
  console.error('❌ React não está carregado!');
} else {
  console.log('✅ React carregado:', React.version);
}

// 3. Verificar se há problemas com hooks
if (typeof React.useState === 'undefined') {
  console.error('❌ React hooks não disponíveis!');
} else {
  console.log('✅ React hooks disponíveis');
}

// 4. Verificar localStorage
try {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token) {
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ Token não encontrado');
  }
  
  if (user) {
    const userData = JSON.parse(user);
    console.log('✅ Usuário:', userData.name, userData.role);
  }
} catch (e) {
  console.error('❌ Erro ao acessar localStorage:', e);
}

// 5. Verificar se API está acessível
const apiUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://zara-backend-production-aab3.up.railway.app/api';

console.log('🌐 Testando conectividade com API:', apiUrl);

fetch(apiUrl + '/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ API acessível:', response.status);
      return response.json();
    } else {
      throw new Error('API não acessível: ' + response.status);
    }
  })
  .then(data => {
    console.log('✅ API funcionando:', data);
  })
  .catch(error => {
    console.error('❌ Erro na API:', error);
  });

// 6. Verificar se há problemas com componentes específicos
setTimeout(() => {
  const dashboardElements = document.querySelectorAll('[class*="dashboard"]');
  const errorElements = document.querySelectorAll('[class*="error"]');
  
  console.log('📊 Elementos dashboard encontrados:', dashboardElements.length);
  console.log('❌ Elementos de erro encontrados:', errorElements.length);
  
  if (errorElements.length > 0) {
    console.log('⚠️ Elementos de erro detectados:');
    errorElements.forEach((el, index) => {
      console.log(`   ${index + 1}. ${el.className}`);
    });
  }
  
  // Verificar se há mensagens de erro específicas
  const errorMessages = document.querySelectorAll('*');
  let accErrorFound = false;
  
  errorMessages.forEach(el => {
    if (el.textContent && el.textContent.includes('acc is not defined')) {
      accErrorFound = true;
      console.log('🎯 Elemento com erro "acc is not defined" encontrado:', el);
    }
  });
  
  if (!accErrorFound && errorCount === 0) {
    console.log('✅ Nenhum erro "acc is not defined" detectado na interface');
  }
  
  console.log('
📋 RESUMO:');
  console.log('- Erros JavaScript:', errorCount);
  console.log('- Elementos dashboard:', dashboardElements.length);
  console.log('- Elementos de erro:', errorElements.length);
  console.log('- Erro "acc" na interface:', accErrorFound ? 'SIM' : 'NÃO');
  
}, 3000);

// 7. Função para forçar re-render se necessário
window.forceRerender = function() {
  console.log('🔄 Forçando re-render...');
  
  // Limpar e recarregar dados do usuário
  const token = localStorage.getItem('token');
  if (token) {
    localStorage.removeItem('user');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    window.location.href = '/login';
  }
};

console.log('✅ Correção aplicada!');
console.log('💡 Se ainda houver problemas, execute: forceRerender()');
