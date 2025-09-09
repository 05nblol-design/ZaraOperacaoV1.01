const jwt = require('jsonwebtoken');
const logger = require('utils/logger');

// Gerar token para o operador Lucas
const token = jwt.sign(
  { id: 2, role: 'OPERATOR' },
  'zara-jwt-secret-key-2024',
  { expiresIn: '24h' }
);

const user = {
  id: 2,
  email: 'lucas.salviano@hotmail.com',
  name: 'Lucas adão salviano',
  role: 'OPERATOR',
  isActive: true
};

logger.info('🔑 Token gerado para o navegador:'););
logger.info(token););
logger.info('\n📋 Execute estes comandos no console do navegador (F12):'););
logger.info(''););
logger.info(`localStorage.setItem('token', '${token}');`););
logger.info(`localStorage.setItem('user', '${JSON.stringify(user)}');`););
logger.info(''););
logger.info('✅ Depois recarregue a página (F5)'););
logger.info(''););
logger.info('👤 Usuário configurado:', user););