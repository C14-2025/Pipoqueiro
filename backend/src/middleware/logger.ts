import { Request, Response, NextFunction } from 'express';

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
} as const;

type LogLevel = 'info' | 'success' | 'warning' | 'error';

const LOG_STYLES: Record<LogLevel, { color: string; icon: string }> = {
  info: { color: colors.blue, icon: 'ℹ️' },
  success: { color: colors.green, icon: '✅' },
  warning: { color: colors.yellow, icon: '⚠️' },
  error: { color: colors.red, icon: '❌' },
};

const METHOD_COLORS: Record<string, string> = {
  GET: colors.green,
  POST: colors.yellow,
  PUT: colors.blue,
  DELETE: colors.red,
  PATCH: colors.magenta,
};

const getMethodColor = (method: string): string =>
  METHOD_COLORS[method] || colors.white;

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.red;
  if (status >= 500) return colors.red + colors.bright;
  return colors.white;
};

const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...body };
  if (sanitized.senha) sanitized.senha = '***';
  if (sanitized.senha_hash) sanitized.senha_hash = '***';
  return sanitized;
};

const formatResponseSummary = (body: string): string => {
  try {
    const parsed = JSON.parse(body);
    if (!parsed || typeof parsed !== 'object') return body.slice(0, 100);

    if (Array.isArray(parsed)) {
      return `Array com ${parsed.length} itens`;
    }

    const summary: any = {};
    if (parsed.success !== undefined) summary.success = parsed.success;
    if (parsed.message) summary.message = parsed.message;
    if (parsed.data) {
      summary.dataType = Array.isArray(parsed.data)
        ? `Array[${parsed.data.length}]`
        : typeof parsed.data;
    }

    return JSON.stringify(summary);
  } catch {
    return body.slice(0, 100);
  }
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleString('pt-BR');

  console.log(`\n${colors.cyan}📥 [${timestamp}] REQUISIÇÃO RECEBIDA${colors.reset}`);
  console.log(`${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.bright}${req.path}${colors.reset}`);

  if (Object.keys(req.params).length > 0) {
    console.log(`${colors.blue}📋 Params:${colors.reset}`, req.params);
  }

  if (Object.keys(req.query).length > 0) {
    console.log(`${colors.blue}🔍 Query:${colors.reset}`, req.query);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`${colors.blue}📦 Body:${colors.reset}`, sanitizeBody(req.body));
  }

  const importantHeaders: Record<string, string | undefined> = {
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

  const originalSend = res.send;
  res.send = function(body: any): Response {
    const duration = Date.now() - startTime;

    console.log(`\n${colors.cyan}📤 [${new Date().toLocaleString('pt-BR')}] RESPOSTA ENVIADA${colors.reset}`);
    console.log(`${getStatusColor(res.statusCode)}${res.statusCode}${colors.reset} ${getMethodColor(req.method)}${req.method}${colors.reset} ${colors.bright}${req.path}${colors.reset} ${colors.yellow}(${duration}ms)${colors.reset}`);
    console.log(`${colors.green}✅ Response:${colors.reset} ${formatResponseSummary(body)}`);
    console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

    return originalSend.call(this, body);
  };

  next();
};

const createLogger = (level: LogLevel) => (message: string, data?: any): void => {
  const { color, icon } = LOG_STYLES[level];
  const output = `${color}${icon}  ${message}${colors.reset}`;

  if (data !== undefined) {
    console.log(output, data);
  } else {
    console.log(output);
  }
};

export const logInfo = createLogger('info');
export const logSuccess = createLogger('success');
export const logWarning = createLogger('warning');
export const logError = createLogger('error');

export const logDatabase = (query: string, params?: any[]): void => {
  console.log(`${colors.magenta}🗄️  DATABASE QUERY:${colors.reset}`);
  console.log(`${colors.magenta}SQL:${colors.reset} ${query}`);

  if (params && params.length > 0) {
    const sanitizedParams = params.map(param =>
      typeof param === 'string' && param.length > 50 ? '***HASH***' : param
    );
    console.log(`${colors.magenta}PARAMS:${colors.reset}`, sanitizedParams);
  }
};