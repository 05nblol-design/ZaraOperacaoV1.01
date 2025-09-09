const jwt = require('jsonwebtoken');
const logger = require('utils/logger');

// Script para testar o hook useMachinePermissions no navegador
function generateBrowserTestScript() {
  // Gerar token para operador Lucas
  const operatorPayload = {
    id: 2,
    role: 'OPERATOR'
  };
  
  const token = jwt.sign(operatorPayload, 'zara-jwt-secret-key-2024', { expiresIn: '24h' });
  
  logger.info('🔧 SCRIPT PARA TESTAR NO NAVEGADOR:'););
  logger.info('\n1. Abra o navegador e vá para: http://localhost:5173/teflon-change'););
  logger.info('\n2. Abra o Console do Desenvolvedor (F12)'););
  logger.info('\n3. Execute os seguintes comandos:'););
  logger.info('\n// Configurar autenticação'););
  logger.info(`localStorage.setItem('token', '${token}');`););
  logger.info(`localStorage.setItem('user', JSON.stringify({`););
  logger.info(`  id: 2,`););
  logger.info(`  name: 'Lucas Operator',`););
  logger.info(`  email: 'lucas@zara.com',`););
  logger.info(`  role: 'OPERATOR'`););
  logger.info(`}));`););
  logger.info('\n// Recarregar a página'););
  logger.info('location.reload();'););
  logger.info('\n4. Após recarregar, execute para monitorar:'););
  logger.info('\n// Monitorar logs do hook'););
  logger.info('console.clear();'););
  logger.info('console.log("🔍 Monitorando hook useMachinePermissions...");'););
  logger.info('\n// Verificar se as máquinas estão sendo carregadas'););
  logger.info('setTimeout(() => {'););
  logger.info('  const selectElement = document.querySelector("select[name=\'machineId\']");'););
  logger.info('  if (selectElement) {'););
  logger.info('    const options = Array.from(selectElement.options);'););
  logger.info('    console.log("📋 Opções no select de máquinas:", options.length);'););
  logger.info('    options.forEach((option, index) => {'););
  logger.info('      if (index > 0) { // Pular a primeira opção "Selecione uma máquina"'););
  logger.info('        console.log(`   ✅ ${option.text} (value: ${option.value})`);'););
  logger.info('      }'););
  logger.info('    });'););
  logger.info('    '););
  logger.info('    if (options.length <= 1) {'););
  logger.info('      console.log("❌ PROBLEMA: Nenhuma máquina aparece no select!");'););
  logger.info('      console.log("   Verifique os logs do hook useMachinePermissions acima.");'););
  logger.info('    }'););
  logger.info('  } else {'););
  logger.info('    console.log("❌ Select de máquinas não encontrado!");'););
  logger.info('  }'););
  logger.info('}, 3000);'););
  logger.info('\n5. Aguarde 3 segundos e verifique os logs no console.'););
  logger.info('\n6. Se ainda não aparecer máquinas, execute também:'););
  logger.info('\n// Forçar reload das máquinas'););
  logger.info('fetch("/api/machines", {'););
  logger.info('  headers: {'););
  logger.info(`    "Authorization": "Bearer ${token}"`););
  logger.info('  }'););
  logger.info('}).then(r => r.json()).then(data => {'););
  logger.info('  console.log("📡 Máquinas da API:", data.data?.length || 0);'););
  logger.info('  data.data?.forEach(machine => {'););
  logger.info('    console.log(`   - ${machine.name} (ID: ${machine.id})`);'););
  logger.info('  });'););
  logger.info('});'););
  logger.info('\n// Verificar permissões'););
  logger.info('fetch("/api/permissions?userId=2", {'););
  logger.info('  headers: {'););
  logger.info(`    "Authorization": "Bearer ${token}"`););
  logger.info('  }'););
  logger.info('}).then(r => r.json()).then(data => {'););
  logger.info('  console.log("🔑 Permissões da API:", data.data?.length || 0);'););
  logger.info('  data.data?.forEach(perm => {'););
  logger.info('    console.log(`   - Máquina ${perm.machineId}: canOperate=${perm.canOperate}`);'););
  logger.info('  });'););
  logger.info('});'););
}

generateBrowserTestScript();