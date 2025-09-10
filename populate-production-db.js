// Script para popular o banco de produção do Railway com máquinas
const https = require('https');

const BACKEND_URL = 'https://zara-backend-production-aab3.up.railway.app';
const ADMIN_CREDENTIALS = {
  email: 'admin@zara.com',
  password: '123456'
};

async function makeRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const request = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            rawData: responseData
          });
        }
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });
    
    if (data) {
      request.write(JSON.stringify(data));
    }
    request.end();
  });
}

async function login() {
  console.log('🔐 Fazendo login como admin...');
  const result = await makeRequest(`${BACKEND_URL}/api/auth/login`, 'POST', ADMIN_CREDENTIALS);
  
  if (result.success && result.data.data && result.data.data.token) {
    console.log(`✅ Login bem-sucedido! Usuário: ${result.data.data.user.name}`);
    return result.data.data.token;
  } else {
    console.log(`❌ Erro no login:`, result);
    return null;
  }
}

async function getMachines(token) {
  console.log('📋 Verificando máquinas existentes...');
  const result = await makeRequest(`${BACKEND_URL}/api/machines`, 'GET', null, token);
  
  if (result.success) {
    const machines = result.data.data || result.data || [];
    console.log(`📊 Máquinas encontradas: ${machines.length}`);
    return machines;
  } else {
    console.log(`❌ Erro ao buscar máquinas:`, result);
    return [];
  }
}

async function createMachine(token, machineData) {
  const result = await makeRequest(`${BACKEND_URL}/api/machines`, 'POST', machineData, token);
  return result;
}

const machinesData = [
  {
    name: 'Máquina de Corte A1',
    type: 'CUTTING',
    status: 'ACTIVE',
    location: 'Setor A - Linha 1',
    model: 'CUT-2024-A1',
    serialNumber: 'CT001A1',
    installationDate: '2024-01-15',
    lastMaintenance: '2024-12-01',
    nextMaintenance: '2025-03-01'
  },
  {
    name: 'Máquina de Costura B2',
    type: 'SEWING',
    status: 'ACTIVE',
    location: 'Setor B - Linha 2',
    model: 'SEW-2024-B2',
    serialNumber: 'SW002B2',
    installationDate: '2024-02-10',
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2025-02-15'
  },
  {
    name: 'Máquina de Acabamento C3',
    type: 'FINISHING',
    status: 'ACTIVE',
    location: 'Setor C - Linha 3',
    model: 'FIN-2024-C3',
    serialNumber: 'FN003C3',
    installationDate: '2024-03-05',
    lastMaintenance: '2024-12-10',
    nextMaintenance: '2025-03-10'
  },
  {
    name: 'Máquina de Prensagem D4',
    type: 'PRESSING',
    status: 'MAINTENANCE',
    location: 'Setor D - Linha 4',
    model: 'PRS-2024-D4',
    serialNumber: 'PR004D4',
    installationDate: '2024-04-20',
    lastMaintenance: '2024-12-20',
    nextMaintenance: '2025-01-20'
  },
  {
    name: 'Máquina de Corte A5',
    type: 'CUTTING',
    status: 'ACTIVE',
    location: 'Setor A - Linha 5',
    model: 'CUT-2024-A5',
    serialNumber: 'CT005A5',
    installationDate: '2024-05-12',
    lastMaintenance: '2024-11-30',
    nextMaintenance: '2025-02-28'
  },
  {
    name: 'Máquina de Costura B6',
    type: 'SEWING',
    status: 'ACTIVE',
    location: 'Setor B - Linha 6',
    model: 'SEW-2024-B6',
    serialNumber: 'SW006B6',
    installationDate: '2024-06-08',
    lastMaintenance: '2024-12-05',
    nextMaintenance: '2025-03-05'
  },
  {
    name: 'Máquina de Acabamento C7',
    type: 'FINISHING',
    status: 'INACTIVE',
    location: 'Setor C - Linha 7',
    model: 'FIN-2024-C7',
    serialNumber: 'FN007C7',
    installationDate: '2024-07-15',
    lastMaintenance: '2024-10-15',
    nextMaintenance: '2025-01-15'
  },
  {
    name: 'Máquina de Prensagem D8',
    type: 'PRESSING',
    status: 'ACTIVE',
    location: 'Setor D - Linha 8',
    model: 'PRS-2024-D8',
    serialNumber: 'PR008D8',
    installationDate: '2024-08-22',
    lastMaintenance: '2024-11-22',
    nextMaintenance: '2025-02-22'
  },
  {
    name: 'Máquina de Corte A9',
    type: 'CUTTING',
    status: 'ACTIVE',
    location: 'Setor A - Linha 9',
    model: 'CUT-2024-A9',
    serialNumber: 'CT009A9',
    installationDate: '2024-09-10',
    lastMaintenance: '2024-12-10',
    nextMaintenance: '2025-03-10'
  },
  {
    name: 'Máquina de Costura B10',
    type: 'SEWING',
    status: 'ACTIVE',
    location: 'Setor B - Linha 10',
    model: 'SEW-2024-B10',
    serialNumber: 'SW010B10',
    installationDate: '2024-10-05',
    lastMaintenance: '2024-12-15',
    nextMaintenance: '2025-03-15'
  }
];

async function main() {
  console.log('🚀 Iniciando população do banco de produção Railway...');
  console.log(`📡 Backend: ${BACKEND_URL}\n`);
  
  // 1. Fazer login
  const token = await login();
  if (!token) {
    console.log('❌ Não foi possível fazer login. Abortando.');
    return;
  }
  
  // 2. Verificar máquinas existentes
  const existingMachines = await getMachines(token);
  
  if (existingMachines.length > 0) {
    console.log('⚠️ Já existem máquinas no banco. Listando:');
    existingMachines.forEach((machine, i) => {
      console.log(`   ${i + 1}. ${machine.name} (${machine.status})`);
    });
    console.log('\n✅ Banco já populado!');
    return;
  }
  
  // 3. Criar máquinas
  console.log('\n🏭 Criando máquinas...');
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < machinesData.length; i++) {
    const machine = machinesData[i];
    console.log(`\n📦 Criando: ${machine.name}`);
    
    const result = await createMachine(token, machine);
    
    if (result.success) {
      console.log(`✅ Criada com sucesso!`);
      successCount++;
    } else {
      console.log(`❌ Erro: ${result.error || result.data?.message || 'Erro desconhecido'}`);
      errorCount++;
    }
    
    // Aguardar um pouco entre criações
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 4. Verificar resultado final
  console.log('\n📊 RESULTADO FINAL:');
  console.log(`✅ Máquinas criadas: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  
  const finalMachines = await getMachines(token);
  console.log(`📋 Total de máquinas no banco: ${finalMachines.length}`);
  
  if (finalMachines.length > 0) {
    console.log('\n🎉 SUCESSO! Banco populado com máquinas.');
    console.log('\n📋 Máquinas no sistema:');
    finalMachines.forEach((machine, i) => {
      console.log(`   ${i + 1}. ${machine.name} - ${machine.status} (${machine.location})`);
    });
  }
}

main().catch(console.error);