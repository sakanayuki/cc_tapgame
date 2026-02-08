import type { LogLevel, Environment } from '../types/index.ts';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const MIN_LEVEL_BY_ENV: Record<Environment, LogLevel> = {
  development: 'DEBUG',
  staging: 'INFO',
  production: 'INFO',
};

function getJstTimestamp(): string {
  const now = new Date();
  const jstOffset = 9 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const jstDate = new Date(utcMs + jstOffset * 60000);

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const y = jstDate.getFullYear();
  const mo = pad(jstDate.getMonth() + 1);
  const d = pad(jstDate.getDate());
  const h = pad(jstDate.getHours());
  const mi = pad(jstDate.getMinutes());
  const s = pad(jstDate.getSeconds());
  const ms = pad(jstDate.getMilliseconds(), 3);

  return `${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}+09:00`;
}

export class Logger {
  private environment: Environment;
  private minLevel: LogLevel;

  constructor(environment?: Environment) {
    this.environment = environment ?? (import.meta.env?.MODE === 'production' ? 'production' : 'development');
    this.minLevel = MIN_LEVEL_BY_ENV[this.environment];
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private log(level: LogLevel, module: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const timestamp = getJstTimestamp();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const formatted = `[${timestamp}] [${level}] [${module}] ${message}${contextStr}`;

    switch (level) {
      case 'DEBUG':
        console.debug(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
        console.error(formatted);
        break;
      case 'FATAL':
        console.error(formatted);
        break;
    }
  }

  debug(module: string, message: string, context?: Record<string, unknown>): void {
    this.log('DEBUG', module, message, context);
  }

  info(module: string, message: string, context?: Record<string, unknown>): void {
    this.log('INFO', module, message, context);
  }

  warn(module: string, message: string, context?: Record<string, unknown>): void {
    this.log('WARN', module, message, context);
  }

  error(module: string, message: string, context?: Record<string, unknown>): void {
    this.log('ERROR', module, message, context);
  }

  fatal(module: string, message: string, context?: Record<string, unknown>): void {
    this.log('FATAL', module, message, context);
  }

  getEnvironment(): Environment {
    return this.environment;
  }
}

export const logger = new Logger();
