// EXEMPLO DE USO DO NOVO SISTEMA DE LOGGING
// Substitua os console.log removidos por:

const logger = require('./utils/logger');

// Em vez de: console.log('Informação')
logger.info('Informação');

// Em vez de: console.error('Erro')
logger.error('Erro', { error: errorObject });

// Em vez de: console.warn('Aviso')
logger.warn('Aviso');

// Em vez de: console.debug('Debug')
logger.debug('Debug');

// Logs estruturados com contexto
logger.info('Usuário logado', { 
    userId: user.id, 
    email: user.email, 
    timestamp: new Date().toISOString() 
});

// Logs de erro com stack trace
try {
    // código que pode falhar
} catch (error) {
    logger.error('Erro na operação', { 
        error: error.message, 
        stack: error.stack,
        context: 'authentication'
    });
}