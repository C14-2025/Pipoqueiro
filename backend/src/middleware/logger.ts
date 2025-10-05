import { Request, Response, NextFunction } from 'express';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const getMethodColor = (method: string): string => {
  switch (method) {
    case 'GET': return colors.green;
    case 'POST': return colors.yellow;
    case 'PUT': return colors.blue;
    case 'DELETE': return colors.red;
    case 'PATCH': return colors.magenta;
    default: return colors.white;
  }
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.red;
  if (status >= 500) return colors.red + colors.bright;
  return colors.white;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString('pt-BR');

  // Log da requisição recebida
  console.log(`\n${colors.cyan}📥 [${timestamp}] REQUISIÇÃO RECEBIDA${colors.reset}`);
  console.log(`${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.bright}${req.path}${colors.reset}`);

  // Log dos parâmetros
  if (Object.keys(req.params).length > 0) {
    console.log(`${colors.blue}📋 Params:${colors.reset}`, req.params);
  }

  // Log da query string
  if (Object.keys(req.query).length > 0) {
    console.log(`${colors.blue}🔍 Query:${colors.reset}`, req.query);
  }

  // Log do body (sem senhas)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.senha) sanitizedBody.senha = '***';
    if (sanitizedBody.senha_hash) sanitizedBody.senha_hash = '***';
    console.log(`${colors.blue}📦 Body:${colors.reset}`, sanitizedBody);
  }

  // Log dos headers importantes
  const importantHeaders = {
    'user-agent': req.get('user-agent'),
    'authorization': req.get('authorization') ? '***' : undefined,
    'content-type': req.get('content-type'),
  };

  const filteredHeaders = Object.fromEntries(
    Object.entries(importantHeaders).filter(([_, value]) => value !== undefined)
  );

  if (Object.keys(filteredHeaders).length > 0) {
    console.log(`${colors.blue}🏷️  Headers:${colors.reset}`, filteredHeaders);
  }

  // Interceptar a resposta
  const originalSend = res.send;
  res.send = function(body: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log da resposta
    console.log(`\n${colors.cyan}📤 [${new Date().toLocaleString('pt-BR')}] RESPOSTA ENVIADA${colors.reset}`);
    console.log(`${getStatusColor(res.statusCode)}${res.statusCode}${colors.reset} ${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.bright}${req.path}${colors.reset} ${colors.yellow}(${duration}ms)${colors.reset}`);

    // Log do body da resposta (limitado para não poluir)
    try {
      const responseBody = JSON.parse(body);
      if (responseBody && typeof responseBody === 'object') {
        // Se for array, mostra só o tamanho
        if (Array.isArray(responseBody)) {
          console.log(`${colors.green}✅ Response:${colors.reset} Array com ${responseBody.length} itens`);
        } else {
          // Se for objeto, mostra estrutura resumida
          const summary = {
            success: responseBody.success,
            message: responseBody.message,
            dataType: responseBody.data ? (Array.isArray(responseBody.data) ? `Array[${responseBody.data.length}]` : typeof responseBody.data) : undefined,
          };
          console.log(`${colors.green}✅ Response:${colors.reset}`, summary);
        }
      }
    } catch (e) {
      console.log(`${colors.green}✅ Response:${colors.reset} ${body.slice(0, 100)}...`);
    }

    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

    return originalSend.call(this, body);
  };

  next();
};

// Função para logs customizados
export const logInfo = (message: string, data?: any) => {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`, data || '');
};

export const logSuccess = (message: string, data?: any) => {
  console.log(`${colors.green}✅ ${message}${colors.reset}`, data || '');
};

export const logWarning = (message: string, data?: any) => {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`, data || '');
};

export const logError = (message: string, data?: any) => {
  console.log(`${colors.red}❌ ${message}${colors.reset}`, data || '');
};

export const logDatabase = (query: string, params?: any[]) => {
  console.log(`${colors.magenta}🗄️  DATABASE QUERY:${colors.reset}`);
  console.log(`${colors.magenta}SQL:${colors.reset} ${query}`);
  if (params && params.length > 0) {
    const sanitizedParams = params.map(param =>
      typeof param === 'string' && param.length > 50 ? '***HASH***' : param
    );
    console.log(`${colors.magenta}PARAMS:${colors.reset}`, sanitizedParams);
  }
};