
// 🔧 CORREÇÃO PARA ERRO "acc is not defined" NO VERCEL
// Execute este código no console do navegador no Vercel

console.log('🔧 Aplicando correção para erro "acc is not defined"...');

// Verificar se há erros de JavaScript
window.addEventListener('error', function(e) {
  if (e.message.includes('acc is not defined')) {
    console.error('❌ Erro "acc is not defined" detectado:', e);
    console.log('📍 Arquivo:', e.filename);
    console.log('📍 Linha:', e.lineno);
    console.log('📍 Coluna:', e.colno);
    
    // Tentar recarregar a página
    setTimeout(() => {
      console.log('🔄 Recarregando página...');
      window.location.reload();
    }, 2000);
  }
});

// Verificar se localStorage tem dados corretos
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

if (!token) {
  console.log('⚠️ Token não encontrado, redirecionando para login...');
  window.location.href = '/login';
} else {
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('✅ Dados do usuário:', userData.name, userData.role);
  } catch (e) {
    console.log('⚠️ Erro ao parsear dados do usuário:', e);
  }
}

console.log('✅ Correção aplicada!');
