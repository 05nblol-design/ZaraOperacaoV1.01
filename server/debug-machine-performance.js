const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simular o endpoint machine-performance localmente para debug
async function debugMachinePerformance() {
  console.log('🔍 Debugando endpoint machine-performance...');
  
  try {
    // Testar conexão com banco
    console.log('1. Testando conexão com banco...');
    const machineCount = await prisma.machine.count();
    console.log(`   ✅ Conexão OK. Máquinas encontradas: ${machineCount}`);
    
    if (machineCount === 0) {
      console.log('   ⚠️  Nenhuma máquina encontrada no banco');
      return {
        success: true,
        data: {
          machines: [],
          summary: {
            totalMachines: 0,
            activeMachines: 0,
            averageEfficiency: 0,
            totalProduction: 0
          }
        }
      };
    }
    
    // Testar busca de máquinas
    console.log('2. Buscando máquinas...');
    const machines = await prisma.machine.findMany({
      include: {
        operations: {
          include: {
            user: true
          }
        }
      }
    });
    console.log(`   ✅ Máquinas carregadas: ${machines.length}`);
    
    // Testar busca de testes de qualidade
    console.log('3. Buscando testes de qualidade...');
    const machinePerformance = [];
    
    for (const machine of machines) {
      console.log(`   🔍 Processando máquina: ${machine.name || machine.code}`);
      
      const tests = await prisma.qualityTest.findMany({
        where: { machineId: machine.id }
      });
      
      const totalTests = tests.length;
      const passedTests = tests.filter(t => t.approved).length;
      
      console.log(`      - Testes encontrados: ${totalTests}`);
      console.log(`      - Testes aprovados: ${passedTests}`);
      
      machinePerformance.push({
        id: machine.id,
        name: machine.name || `Máquina ${machine.code}`,
        status: machine.status || 'UNKNOWN',
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        lastMaintenance: machine.lastMaintenance
      });
    }
    
    // Calcular estatísticas
    console.log('4. Calculando estatísticas...');
    const avgEfficiency = machinePerformance.length > 0 
      ? machinePerformance.reduce((sum, m) => sum + m.passRate, 0) / machinePerformance.length 
      : 0;
    
    const statusCount = {
      operating: 0,
      maintenance: 0,
      stopped: 0,
      testing: 0
    };
    
    let totalTests = 0;
    machinePerformance.forEach(machine => {
      totalTests += machine.totalTests;
      switch (machine.status) {
        case 'RUNNING':
        case 'OPERATING':
          statusCount.operating++;
          break;
        case 'MAINTENANCE':
          statusCount.maintenance++;
          break;
        case 'STOPPED':
        case 'ERROR':
          statusCount.stopped++;
          break;
        case 'TESTING':
          statusCount.testing++;
          break;
      }
    });
    
    const result = {
      success: true,
      data: {
        machines: machinePerformance,
        summary: {
          totalMachines: machines.length,
          activeMachines: statusCount.operating,
          averageEfficiency: Math.round(avgEfficiency * 10) / 10,
          totalProduction: totalTests
        },
        statusCount,
        avgDowntime: 2.1,
        avgUtilization: 94.2
      }
    };
    
    console.log('✅ Debug concluído com sucesso!');
    console.log('📊 Resultado:', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar debug
debugMachinePerformance()
  .then(() => {
    console.log('\n🎉 Debug finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error.message);
    process.exit(1);
  });