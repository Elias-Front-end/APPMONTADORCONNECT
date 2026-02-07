import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logger';
import { ZodError } from 'zod';

const logger = createLogger('ErrorHandler');

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado após todas as rotas
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log detalhado do erro
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: (req.user as any)?.id || 'anonymous',
  });

  // Tratamento específico para erros de validação Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Erro de validação',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Tratamento para erros de banco de dados (constraint violations)
  if (err instanceof Error && 'code' in err) {
    const dbError = err as any;
    
    // Unique constraint violation
    if (dbError.code === '23505') {
      return res.status(409).json({
        message: 'Este registro já existe no sistema.',
      });
    }
    
    // Foreign key violation
    if (dbError.code === '23503') {
      return res.status(400).json({
        message: 'Referência inválida. Verifique os dados relacionados.',
      });
    }
  }

  // Erro genérico (não expor detalhes em produção)
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    message: 'Erro interno do servidor',
    ...(isDevelopment && { error: err.message, stack: err.stack }),
  });
}
