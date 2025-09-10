// Testar conectividade com Railway

async function testRailwayConnection() {
  const urls = [
    'https://zaraoperacaov101-production.up.railway.app',
    'https://zaraoperacaov101-production.up.railway.app/api/health',
    'https://zaraoperacaov101-production.up.railway.app/api/auth/login'
  ];
  
  console.log('🔍 Testando conectividade com Railway...');
  
  for (const url of urls) {
    try {
      console.log(`\n📡 Testando: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('📊 Status:', response.status);
      console.log('📊 Status Text:', response.statusText);
      console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const text = await response.text();
        console.log('📄 Response (primeiros 200 chars):', text.substring(0, 200));
      } else {
        console.log('❌ Response não OK');
      }
      
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
  }
  
  // Testar POST para login
  console.log('\n🔐 Testando POST para login...');
  try {
    const response = await fetch('https://zaraoperacaov101-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });
    
    console.log('📊 POST Status:', response.status);
    const data = await response.json();
    console.log('📄 POST Response:', data);
    
  } catch (error) {
    console.log('❌ POST Erro:', error.message);
  }
}

testRailwayConnection();