const puppeteer = require('puppeteer');
const jwt = require('jsonwebtoken');
const logger = require('utils/logger');

async function debugFrontendMachines() {
  logger.info('🔍 Iniciando debug do frontend - máquinas não aparecem');
  
  // Gerar token válido para operador Lucas
  const operatorToken = jwt.sign(
    { 
      id: 2, 
      role: 'OPERATOR', 
      name: 'Lucas Silva',
      email: 'lucas@zara.com'
    }, 
    'zara-jwt-secret-key-2024',
    { expiresIn: '24h' }
  );
  
  logger.info('✅ Token gerado para operador Lucas');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Interceptar logs do console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (text.includes('useMachinePermissions') || 
        text.includes('TeflonChange') ||
        text.includes('machines') ||
        text.includes('permissions') ||
        text.includes('API') ||
        text.includes('error') ||
        text.includes('Error')) {
      logger.info(`🖥️  [${type.toUpperCase()}] ${text}`);
    }
  });
  
  // Interceptar requisições de rede
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      logger.info(`🌐 API Response: ${response.status()} - ${url}`);
    }
  });
  
  try {
    logger.info('🌐 Navegando para página de mudança de teflon...');
    await page.goto('http://localhost:5173/teflon/change', { waitUntil: 'networkidle0' });
    
    // Configurar autenticação no localStorage
    await page.evaluate((token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: 2,
        name: 'Lucas Silva',
        email: 'lucas@zara.com',
        role: 'OPERATOR'
      }));
    }, operatorToken);
    
    logger.info('🔑 Token e dados do usuário configurados no localStorage');
    
    // Recarregar página para aplicar autenticação
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Aguardar um pouco para componentes carregarem
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verificar se select de máquinas existe
    const machineSelect = await page.$('select');
    if (machineSelect) {
      const options = await page.$$eval('select option', options => 
        options.map(option => ({ value: option.value, text: option.textContent }))
      );
      logger.info('📋 Opções encontradas no select:', options);
    } else {
      logger.info('❌ Select de máquinas não encontrado');
    }
    
    // Verificar estado dos hooks
    const hookStates = await page.evaluate(() => {
      return {
        localStorage: {
          token: localStorage.getItem('token') ? 'presente' : 'ausente',
          user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'ausente'
        },
        url: window.location.href
      };
    });
    
    logger.info('🔍 Estado atual:', hookStates);
    
    // Aguardar mais um pouco para ver se algo muda
    logger.info('⏳ Aguardando mais logs...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    logger.error('❌ Erro durante debug:', error);
  } finally {
    logger.info('🏁 Debug finalizado - verifique os logs acima');
    await browser.close();
  }
}

logger.error(debugFrontendMachines().catch(console.error);