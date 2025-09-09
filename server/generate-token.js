const jwt = require('jsonwebtoken');
const logger = require('utils/logger');
const SECRET_KEY = 'zara-jwt-secret-key-2024';

// Gerar token para usuário Lucas (ID: 2, OPERATOR)
const token = jwt.sign(
  { id: 2, role: 'OPERATOR' },
  SECRET_KEY,
  { expiresIn: '24h' }
);

logger.info('Token gerado:', token););