import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../logger';

const logger = createLogger('AuthMiddleware');

/**
 * Middleware que requer autenticação para acessar a rota
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    logger.warn(`Unauthorized access attempt to ${req.path} from IP: ${req.ip}`);
    return res.sendStatus(401);
  }
  next();
}

/**
 * Middleware que requer um role específico para acessar a rota
 * @param roles - Array de roles permitidos
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      logger.warn(`Unauthorized access attempt to ${req.path} from IP: ${req.ip}`);
      return res.sendStatus(401);
    }

    const user = req.user as any;
    if (!user || !roles.includes(user.role)) {
      logger.warn(`Forbidden access attempt by user ${user?.id} (role: ${user?.role}) to ${req.path}`);
      return res.sendStatus(403);
    }
    
    next();
  };
}
