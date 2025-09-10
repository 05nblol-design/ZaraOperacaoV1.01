const logger = require('../utils/logger');
// Configurações de segurança para produção

// Configurações de CORS para diferentes ambientes
const getCorsConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    origin: function (origin, callback) {
      // CORREÇÃO TEMPORÁRIA: Permitir todas as origens Vercel
      if (isProduction) {
        // Permitir requisições sem origin (health checks, Railway)
        if (!origin) {
          return callback(null, true);
        }
        
        // Permitir todas as URLs Vercel
        if (origin.includes('vercel.app') || origin.includes('sistema-zara-frontend')) {
          logger.info(`✅ CORS permitido para Vercel: ${origin}`);
          return callback(null, true);
        }
        
        // Permitir origens específicas
        const allowedOrigins = [
          'https://sistema-zara-frontend.vercel.app',
          'https://sistema-zara-frontend-i90xa6vrg-05nblol-designs-projects.vercel.app',
          'https://sistema-zara-frontend-cp1cg9k3p-05nblol-designs-projects.vercel.app'
        ];
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        logger.warn(`🚫 CORS blocked origin: ${origin}`);
        return callback(new Error('Não permitido pelo CORS'));
      } else {
        // Desenvolvimento - permitir localhost
        const devOrigins = [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174'
        ];
        
        if (!origin || devOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        return callback(new Error('Não permitido pelo CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-File-Name'
    ],
    exposedHeaders: [
      'X-Total-Count', 
      'X-Page-Count',
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining'
    ],
    maxAge: isProduction ? 86400 : 3600 // 24h em produção, 1h em desenvolvimento
  };
};

// Configurações do Helmet para diferentes ambientes
const getHelmetConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "https:",
          "blob:"
        ],
        scriptSrc: isProduction 
          ? ["'self'"] 
          : ["'self'", "'unsafe-eval'"], // unsafe-eval apenas para desenvolvimento
        connectSrc: [
          "'self'", 
          "wss:", 
          "ws:",
          process.env.API_URL,
          process.env.SOCKET_URL
        ].filter(Boolean),
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        ...(isProduction && { upgradeInsecureRequests: [] })
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'cross-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: isProduction ? {
      maxAge: 31536000, // 1 ano
      includeSubDomains: true,
      preload: true
    } : false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  };
};

// Configurações de Rate Limiting
const getRateLimitConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Rate limit geral
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: isProduction 
        ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 
        : 10000, // desenvolvimento: 10000, produção: 100
      message: {
        error: 'Muitas requisições',
        message: 'Tente novamente em alguns minutos',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        return req.method === 'OPTIONS' || req.path === '/api/health';
      }
    },
    
    // Rate limit para autenticação - DESABILITADO
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 10000, // DESABILITADO - permitir muitas tentativas
      message: {
        error: 'Muitas tentativas de login',
        message: 'Tente novamente em 15 minutos',
        retryAfter: 900
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    },
    
    // Rate limit para upload
    upload: {
      windowMs: 60 * 1000, // 1 minuto
      max: isProduction ? 5 : 20, // produção: 5, desenvolvimento: 20
      message: {
        error: 'Muitos uploads',
        message: 'Aguarde um momento antes de fazer outro upload',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    }
  };
};

// Lista de IPs confiáveis (para bypass de rate limiting em produção)
const getTrustedIPs = () => {
  const trustedIPs = (process.env.TRUSTED_IPS || '').split(',').map(ip => ip.trim()).filter(Boolean);
  return trustedIPs;
};

// Configurações de sessão segura
const getSessionConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS apenas em produção
      httpOnly: true,
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 horas
      sameSite: isProduction ? 'strict' : 'lax'
    },
    name: 'zara.sid' // Nome customizado para o cookie de sessão
  };
};

// Configurações de upload seguro
const getUploadConfig = () => {
  return {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      files: parseInt(process.env.MAX_FILES_COUNT) || 5,
      fieldNameSize: 100,
      fieldSize: 1024 * 1024, // 1MB
      fields: 20
    },
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    tempDir: process.env.TEMP_DIR || './temp'
  };
};

// Configurações de logging de segurança
const getSecurityLoggingConfig = () => {
  return {
    enabled: process.env.SECURITY_LOGGING === 'true' || process.env.NODE_ENV === 'production',
    logLevel: process.env.LOG_LEVEL || 'warn',
    logSuspiciousRequests: true,
    logFailedAuth: true,
    logRateLimitHits: true,
    maxLogSize: process.env.MAX_LOG_SIZE || '10m',
    maxLogFiles: process.env.MAX_LOG_FILES || '5'
  };
};

module.exports = {
  getCorsConfig,
  getHelmetConfig,
  getRateLimitConfig,
  getTrustedIPs,
  getSessionConfig,
  getUploadConfig,
  getSecurityLoggingConfig
};