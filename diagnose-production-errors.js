const axios = require('axios');
const fs = require('fs');

// URLs dos ambientes
const ENVIRONMENTS = {
  local: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:5000/api'
  },
  vercel: {
    frontend: 'https://sistema-zara-frontend.vercel.app',
    backend: 'https://sistema-zara-backend.vercel.app/api'
  },
  railway: {
    backend: 'https://zaraoperacaov101-production.up.railway.app/api'
  }
};

// Credenciais de teste
const TEST_CREDENTIALS = {
  email: 'admin@zara.com',
  password: 'admin123'
};

// Endpoints críticos para testar
const CRITICAL_ENDPOINTS = [
  '/auth/login',
  '/reports/manager-dashboard',
  '/reports/leader-dashboard',
  '/machines',
  '/users',
  '/reports/quality-metrics'
];

async function testEnvironment(envName, config) {
  console.log(`\n🔍 TESTANDO AMBIENTE: ${envName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  const results = {
    environment: envName,
    timestamp: new Date().toISOString(),
    frontend: null,
    backend: null,
    endpoints: {},
    errors: []
  };
  
  // Testar Frontend
  if (config.frontend) {
    console.log(`\n📱 Frontend: ${config.frontend}`);
    try {
      const frontendResponse = await axios.get(config.frontend, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      results.frontend = {
        status: frontendResponse.status,
        accessible: frontendResponse.status < 400,
        size: frontendResponse.data?.length || 0
      };
      
      console.log(`   ✅ Status: ${frontendResponse.status}`);
      
      // Testar páginas específicas
      const pages = ['/manager-dashboard', '/leader-dashboard', '/login'];
      for (const page of pages) {
        try {
          const pageResponse = await axios.get(`${config.frontend}${page}`, {
            timeout: 5000,
            validateStatus: () => true
          });
          console.log(`   📄 ${page}: ${pageResponse.status}`);
        } catch (error) {
          console.log(`   ❌ ${page}: ${error.message}`);
          results.errors.push(`Frontend ${page}: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Frontend inacessível: ${error.message}`);
      results.frontend = { accessible: false, error: error.message };
      results.errors.push(`Frontend: ${error.message}`);
    }
  }
  
  // Testar Backend
  if (config.backend) {
    console.log(`\n🔧 Backend: ${config.backend}`);
    let authToken = null;
    
    try {
      // Teste de conectividade básica
      const healthResponse = await axios.get(`${config.backend}/health`, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      results.backend = {
        accessible: healthResponse.status < 500,
        status: healthResponse.status
      };
      
      console.log(`   🏥 Health Check: ${healthResponse.status}`);
      
    } catch (error) {
      console.log(`   ❌ Backend inacessível: ${error.message}`);
      results.backend = { accessible: false, error: error.message };
      results.errors.push(`Backend: ${error.message}`);
      return results;
    }
    
    // Testar Login
    try {
      console.log(`\n🔐 Testando Login...`);
      const loginResponse = await axios.post(`${config.backend}/auth/login`, TEST_CREDENTIALS, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      console.log(`   📊 Status: ${loginResponse.status}`);
      
      if (loginResponse.status === 200 && loginResponse.data.success) {
        authToken = loginResponse.data.data?.token;
        console.log(`   ✅ Login bem-sucedido`);
        console.log(`   👤 Usuário: ${loginResponse.data.data?.user?.name}`);
        console.log(`   🔑 Role: ${loginResponse.data.data?.user?.role}`);
      } else {
        console.log(`   ❌ Login falhou:`, loginResponse.data);
        results.errors.push(`Login failed: ${JSON.stringify(loginResponse.data)}`);
      }
      
      results.endpoints['/auth/login'] = {
        status: loginResponse.status,
        success: loginResponse.data?.success || false,
        data: loginResponse.data
      };
      
    } catch (error) {
      console.log(`   ❌ Erro no login: ${error.message}`);
      results.errors.push(`Login error: ${error.message}`);
      results.endpoints['/auth/login'] = {
        error: error.message,
        status: error.response?.status
      };
    }
    
    // Testar outros endpoints se temos token
    if (authToken) {
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };
      
      console.log(`\n🧪 Testando Endpoints Críticos...`);
      
      for (const endpoint of CRITICAL_ENDPOINTS.slice(1)) { // Skip login já testado
        try {
          console.log(`   🔍 ${endpoint}...`);
          
          let url = `${config.backend}${endpoint}`;
          if (endpoint.includes('dashboard')) {
            url += '?timeRange=today';
          }
          
          const response = await axios.get(url, {
            headers,
            timeout: 15000,
            validateStatus: () => true
          });
          
          const success = response.status === 200 && response.data?.success !== false;
          console.log(`   ${success ? '✅' : '❌'} ${endpoint}: ${response.status}`);
          
          if (!success && response.data) {
            console.log(`      📝 Erro: ${JSON.stringify(response.data, null, 2)}`);
          }
          
          results.endpoints[endpoint] = {
            status: response.status,
            success: success,
            data: response.data,
            responseTime: response.headers['x-response-time']
          };
          
          if (!success) {
            results.errors.push(`${endpoint}: ${response.status} - ${JSON.stringify(response.data)}`);
          }
          
        } catch (error) {
          console.log(`   ❌ ${endpoint}: ${error.message}`);
          results.errors.push(`${endpoint}: ${error.message}`);
          results.endpoints[endpoint] = {
            error: error.message,
            status: error.response?.status
          };
        }
      }
    }
  }
  
  return results;
}

async function diagnoseAllEnvironments() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DO SISTEMA ZARA');
  console.log('=====================================');
  console.log('🕐 Iniciado em:', new Date().toLocaleString());
  
  const allResults = [];
  
  // Testar cada ambiente
  for (const [envName, config] of Object.entries(ENVIRONMENTS)) {
    try {
      const result = await testEnvironment(envName, config);
      allResults.push(result);
    } catch (error) {
      console.error(`❌ Erro ao testar ${envName}:`, error.message);
      allResults.push({
        environment: envName,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Gerar relatório final
  console.log('\n📊 RELATÓRIO FINAL');
  console.log('==================');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalEnvironments: allResults.length,
      healthyEnvironments: 0,
      totalErrors: 0
    },
    environments: allResults,
    recommendations: []
  };
  
  allResults.forEach(result => {
    console.log(`\n🌐 ${result.environment?.toUpperCase()}:`);
    
    if (result.error) {
      console.log(`   ❌ Erro geral: ${result.error}`);
      report.summary.totalErrors++;
      return;
    }
    
    if (result.frontend) {
      console.log(`   📱 Frontend: ${result.frontend.accessible ? '✅' : '❌'} (${result.frontend.status || 'N/A'})`);
    }
    
    if (result.backend) {
      console.log(`   🔧 Backend: ${result.backend.accessible ? '✅' : '❌'} (${result.backend.status || 'N/A'})`);
    }
    
    const errorCount = result.errors?.length || 0;
    console.log(`   🐛 Erros: ${errorCount}`);
    
    if (errorCount === 0 && result.frontend?.accessible && result.backend?.accessible) {
      report.summary.healthyEnvironments++;
    }
    
    report.summary.totalErrors += errorCount;
    
    if (result.errors?.length > 0) {
      console.log(`   📝 Detalhes dos erros:`);
      result.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    }
  });
  
  // Gerar recomendações
  if (report.summary.totalErrors > 0) {
    report.recommendations.push('Verificar logs detalhados dos serviços com erro');
    report.recommendations.push('Validar configurações de CORS e variáveis de ambiente');
    report.recommendations.push('Testar conectividade de banco de dados');
    report.recommendations.push('Verificar se todos os serviços estão rodando');
  }
  
  // Salvar relatório
  const reportFile = `production-diagnosis-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n💾 Relatório salvo em: ${reportFile}`);
  console.log(`\n🏁 Diagnóstico concluído!`);
  console.log(`   ✅ Ambientes saudáveis: ${report.summary.healthyEnvironments}/${report.summary.totalEnvironments}`);
  console.log(`   🐛 Total de erros: ${report.summary.totalErrors}`);
  
  return report;
}

// Executar diagnóstico
diagnoseAllEnvironments().catch(console.error);