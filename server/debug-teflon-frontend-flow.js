const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('utils/logger');

// Simular exatamente o fluxo do frontend TeflonChange
async function debugTeflonFrontendFlow() {
  logger.info('🔍 DEBUGGING: Fluxo completo do TeflonChange frontend\n');
  
  try {
    // 1. Gerar token para operador Lucas
    const operatorPayload = {
      id: 2,
      role: 'OPERATOR'
    };
    
    const token = jwt.sign(operatorPayload, 'zara-jwt-secret-key-2024', { expiresIn: '24h' });
    logger.info('🔑 Token gerado para operador Lucas');
    
    // 2. Simular carregamento de máquinas (como no TeflonChange.loadMachines)
    logger.info('\n📡 Passo 1: Carregando máquinas da API...');
    const machinesResponse = await axios.get('http://localhost:3001/api/machines', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const allMachines = machinesResponse.data.data || [];
    logger.info(`✅ Máquinas recebidas da API: ${allMachines.length}`);
    allMachines.forEach(machine => {
      logger.info(`   - ${machine.name} (ID: ${machine.id}) - Status: ${machine.status}`);
    });
    
    // 3. Simular carregamento de permissões (como no useMachinePermissions)
    logger.info('\n📡 Passo 2: Carregando permissões do operador...');
    const permissionsResponse = await axios.get(`http://localhost:3001/api/permissions?userId=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const permissions = permissionsResponse.data.data || [];
    logger.info(`✅ Permissões carregadas: ${permissions.length}`);
    permissions.forEach(permission => {
      logger.info(`   - Máquina ${permission.machineId} (${permission.machine?.name}): canView=${permission.canView}, canOperate=${permission.canOperate}`);
    });
    
    // 4. Simular filterMachinesByPermissions com 'canOperate'
    logger.info('\n🔍 Passo 3: Aplicando filtro filterMachinesByPermissions(machines, "canOperate")...');
    
    const filteredMachines = allMachines.filter(machine => {
      const permission = permissions.find(p => p.machineId === machine.id);
      const canOperate = permission ? permission.canOperate : false;
      logger.info(`   🔍 Máquina ${machine.id} (${machine.name}) - canOperate: ${canOperate}`);
      return canOperate;
    });
    
    logger.info(`\n✅ Máquinas após filtro canOperate: ${filteredMachines.length}`);
    
    if (filteredMachines.length > 0) {
      logger.info('\n📋 Máquinas que DEVERIAM aparecer no select do TeflonChange:');
      filteredMachines.forEach(machine => {
        logger.info(`   ✅ ${machine.name} - ${machine.location}`);
      });
      
      logger.info('\n🎯 DIAGNÓSTICO: O filtro está funcionando corretamente!');
      logger.info('   Se as máquinas ainda não aparecem no frontend, verifique:');
      logger.info('   1. Se o hook useMachinePermissions está sendo chamado corretamente');
      logger.info('   2. Se há erros no console do navegador');
      logger.info('   3. Se o estado das máquinas está sendo atualizado no componente');
      logger.info('   4. Se o token está sendo enviado corretamente nas requisições');
    } else {
      logger.info('\n❌ PROBLEMA: Nenhuma máquina passou no filtro canOperate!');
      logger.info('   Isso significa que o operador não tem permissão de OPERAÇÃO em nenhuma máquina.');
      logger.info('   Para troca de teflon, é necessário ter canOperate = true.');
    }
    
    // 5. Verificar se há diferença entre canView e canOperate
    const canViewMachines = allMachines.filter(machine => {
      const permission = permissions.find(p => p.machineId === machine.id);
      return permission ? permission.canView : false;
    });
    
    logger.info('\n📊 Comparação de permissões:');
    logger.info(`   - Máquinas com canView: ${canViewMachines.length}`);
    logger.info(`   - Máquinas com canOperate: ${filteredMachines.length}`);
    
    if (canViewMachines.length > filteredMachines.length) {
      logger.info('\n⚠️  ATENÇÃO: O operador pode VER mais máquinas do que pode OPERAR!');
      logger.info('   Isso é normal - para troca de teflon só aparecem máquinas que pode operar.');
    }
    
  } catch (error) {
    logger.error('❌ Erro no debug:', error.message);
    if (error.response) {
      logger.error('   Status:', error.response.status);
      logger.error('   Data:', error.response.data);
    }
  }
}

debugTeflonFrontendFlow();