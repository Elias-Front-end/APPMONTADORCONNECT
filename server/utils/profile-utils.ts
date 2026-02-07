import { InsertProfile } from '@shared/schema';

/**
 * Roles permitidos no sistema
 */
export const ALLOWED_ROLES = ['montador', 'marcenaria', 'lojista'] as const;
export type AllowedRole = typeof ALLOWED_ROLES[number];

/**
 * Valida se um role é permitido no sistema
 * @param role - Role a ser validado
 * @returns true se o role é válido
 */
export function validateRole(role: string): role is AllowedRole {
  return ALLOWED_ROLES.includes(role as AllowedRole);
}

/**
 * Sanitiza os dados de entrada do perfil
 * - Converte strings vazias em null para campos únicos
 * - Remove campos inválidos
 * @param input - Dados do perfil a serem sanitizados
 * @returns Dados sanitizados
 */
export function sanitizeProfileInput(input: Partial<InsertProfile>): Partial<InsertProfile> {
  const sanitized = { ...input };
  
  // Converter strings vazias em null para campos únicos (evita violação de constraint)
  if (sanitized.cpf === '') {
    sanitized.cpf = null;
  }
  
  // Remover espaços em branco extras
  if (typeof sanitized.fullName === 'string') {
    sanitized.fullName = sanitized.fullName.trim();
  }
  
  if (typeof sanitized.phone === 'string') {
    sanitized.phone = sanitized.phone.trim();
  }
  
  if (typeof sanitized.region === 'string') {
    sanitized.region = sanitized.region.trim();
  }
  
  return sanitized;
}

/**
 * Valida se um CPF tem formato válido (apenas números)
 * Não valida dígitos verificadores
 * @param cpf - CPF a ser validado
 * @returns true se o formato é válido
 */
export function isValidCpfFormat(cpf: string | null): boolean {
  if (!cpf) return true; // CPF é opcional
  
  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // CPF deve ter exatamente 11 dígitos
  return cleanCpf.length === 11;
}
