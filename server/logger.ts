
import fs from 'fs';
import path from 'path';

// Define log levels
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
}

const config: LoggerConfig = {
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 'DEBUG',
};

const levels: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Helper to format arguments
const formatArgs = (args: any[]): string => {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack}`;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
};

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (levels[level] < levels[config.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const message = formatArgs(args);
    
    // Format: [TIMESTAMP] [LEVEL] [CONTEXT] Message
    const logLine = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    // Colorize for console (optional, but good for local dev)
    switch (level) {
      case 'DEBUG':
        console.debug(logLine);
        break;
      case 'INFO':
        console.info(logLine);
        break;
      case 'WARN':
        console.warn(logLine);
        break;
      case 'ERROR':
        console.error(logLine);
        break;
    }
  }

  debug(...args: any[]) {
    this.log('DEBUG', ...args);
  }

  info(...args: any[]) {
    this.log('INFO', ...args);
  }

  warn(...args: any[]) {
    this.log('WARN', ...args);
  }

  error(...args: any[]) {
    this.log('ERROR', ...args);
  }
}

export const createLogger = (context: string) => new Logger(context);
