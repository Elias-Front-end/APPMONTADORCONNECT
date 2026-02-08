import rateLimit from 'express-rate-limit';
import { createLogger } from '../logger';

const logger = createLogger('RateLimit');

// Rate limiter para rotas de autenticação
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 tentativas por janela (Aumentado para testes)
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
    res.status(429).json({
      message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    });
  },
});

// Rate limiter mais permissivo para outras rotas da API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por janela
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
    res.status(429).json({
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
    });
  },
});
