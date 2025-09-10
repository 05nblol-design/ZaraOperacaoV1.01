// SCRIPT PARA LIMPAR COMPLETAMENTE O STORAGE DO FRONTEND
// Execute este código no console do navegador em: https://sistema-zara-frontend.vercel.app

console.log('🧹 Limpando completamente o storage do frontend...');

// 1. Limpar localStorage
console.log('📦 Limpando localStorage...');
const localStorageKeys = Object.keys(localStorage);
console.log('   Chaves encontradas:', localStorageKeys);
localStorage.clear();
console.log('   ✅ localStorage limpo');

// 2. Limpar sessionStorage
console.log('📦 Limpando sessionStorage...');
const sessionStorageKeys = Object.keys(sessionStorage);
console.log('   Chaves encontradas:', sessionStorageKeys);
sessionStorage.clear();
console.log('   ✅ sessionStorage limpo');

// 3. Limpar cookies relacionados ao dominio
console.log('🍪 Limpando cookies...');
const cookies = document.cookie.split(';');
for (let cookie of cookies) {
  const eqPos = cookie.indexOf('=');
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  if (name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=sistema-zara-frontend.vercel.app`;
  }
}
console.log('   ✅ Cookies limpos');

// 4. Limpar IndexedDB (se existir)
console.log('🗄️ Verificando IndexedDB...');
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      console.log(`   Removendo database: ${db.name}`);
      indexedDB.deleteDatabase(db.name);
    });
  }).catch(err => {
    console.log('   ⚠️ Erro ao limpar IndexedDB:', err);
  });
}

// 5. Limpar WebSQL (se existir)
if ('openDatabase' in window) {
  console.log('🗄️ WebSQL detectado (legado)');
}

// 6. Limpar Service Workers
console.log('⚙️ Verificando Service Workers...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('   Removendo Service Worker:', registration.scope);
      registration.unregister();
    });
  });
}

// 7. Limpar Cache API
console.log('💾 Verificando Cache API...');
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      console.log(`   Removendo cache: ${cacheName}`);
      caches.delete(cacheName);
    });
  });
}

// 8. Verificar se ainda há dados
setTimeout(() => {
  console.log('\n🔍 Verificação final:');
  console.log('   localStorage keys:', Object.keys(localStorage));
  console.log('   sessionStorage keys:', Object.keys(sessionStorage));
  console.log('   cookies:', document.cookie);
  
  if (Object.keys(localStorage).length === 0 && 
      Object.keys(sessionStorage).length === 0) {
    console.log('\n✅ LIMPEZA COMPLETA REALIZADA COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Recarregue a página (F5 ou Ctrl+R)');
    console.log('2. Faça login normalmente');
    console.log('3. Teste o logout para verificar se o problema foi resolvido');
    
    // Recarregar automaticamente após 3 segundos
    console.log('\n🔄 Recarregando página em 3 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } else {
    console.log('\n⚠️ Alguns dados ainda persistem. Tente recarregar manualmente.');
  }
}, 1000);

console.log('\n' + '='.repeat(60));
console.log('🎯 SCRIPT DE LIMPEZA EXECUTADO');
console.log('Aguarde a verificação final...');
console.log('='.repeat(60));