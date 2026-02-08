import { z } from 'zod';
import { 
  insertProfileSchema, 
  insertCompanySchema, 
  insertServiceSchema, 
  insertPartnershipSchema,
  insertCalendarEventSchema,
  insertServiceAttachmentSchema,
  insertServiceAssignmentSchema,
  insertReviewSchema,
  profiles, 
  companies, 
  services, 
  partnerships,
  calendarEvents,
  serviceAttachments,
  serviceAssignments,
  reviews,
  userRoleEnum,
  serviceStatusEnum,
  partnershipStatusEnum,
  fileTypeEnum,
  assignmentStatusEnum,
  complexityLevelEnum
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  profiles: {
    me: { method: 'GET' as const, path: '/api/profiles/me', responses: { 200: z.custom<typeof profiles.$inferSelect>(), 404: errorSchemas.notFound } },
    update: { method: 'PUT' as const, path: '/api/profiles/me', input: insertProfileSchema.partial(), responses: { 200: z.custom<typeof profiles.$inferSelect>(), 400: errorSchemas.validation } },
    create: { method: 'POST' as const, path: '/api/profiles', input: insertProfileSchema, responses: { 201: z.custom<typeof profiles.$inferSelect>(), 400: errorSchemas.validation } }
  },
  companies: {
    list: { method: 'GET' as const, path: '/api/companies', responses: { 200: z.array(z.custom<typeof companies.$inferSelect>()) } },
    get: { method: 'GET' as const, path: '/api/companies/:id', responses: { 200: z.custom<typeof companies.$inferSelect>(), 404: errorSchemas.notFound } },
    create: { method: 'POST' as const, path: '/api/companies', input: insertCompanySchema, responses: { 201: z.custom<typeof companies.$inferSelect>(), 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/companies/:id', input: insertCompanySchema.partial(), responses: { 200: z.custom<typeof companies.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound } },
  },
  services: {
    list: { method: 'GET' as const, path: '/api/services', input: z.object({ status: z.enum(serviceStatusEnum.enumValues).optional(), companyId: z.coerce.number().optional() }).optional(), responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) } },
    get: { method: 'GET' as const, path: '/api/services/:id', responses: { 200: z.custom<typeof services.$inferSelect>(), 404: errorSchemas.notFound } },
    create: { method: 'POST' as const, path: '/api/services', input: insertServiceSchema, responses: { 201: z.custom<typeof services.$inferSelect>(), 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/services/:id', input: insertServiceSchema.partial(), responses: { 200: z.custom<typeof services.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound } },
    delete: { method: 'DELETE' as const, path: '/api/services/:id', responses: { 204: z.void(), 404: errorSchemas.notFound } },
    
    // Sub-resources
    getAssignments: { method: 'GET' as const, path: '/api/services/:id/assignments', responses: { 200: z.array(z.custom<typeof serviceAssignments.$inferSelect>()) } },
    assign: { method: 'POST' as const, path: '/api/services/:id/assignments', input: insertServiceAssignmentSchema, responses: { 201: z.custom<typeof serviceAssignments.$inferSelect>(), 400: errorSchemas.validation } },
    
    getAttachments: { method: 'GET' as const, path: '/api/services/:id/attachments', responses: { 200: z.array(z.custom<typeof serviceAttachments.$inferSelect>()) } },
    addAttachment: { method: 'POST' as const, path: '/api/services/:id/attachments', input: insertServiceAttachmentSchema, responses: { 201: z.custom<typeof serviceAttachments.$inferSelect>(), 400: errorSchemas.validation } },

    getReviews: { method: 'GET' as const, path: '/api/services/:id/reviews', responses: { 200: z.array(z.custom<typeof reviews.$inferSelect>()) } },
    addReview: { method: 'POST' as const, path: '/api/services/:id/reviews', input: insertReviewSchema, responses: { 201: z.custom<typeof reviews.$inferSelect>(), 400: errorSchemas.validation } },
    confirmCompletion: { method: 'POST' as const, path: '/api/services/:id/confirm-completion', responses: { 200: z.object({ message: z.string() }), 400: errorSchemas.validation } },
  },
  calendar: {
    list: { method: 'GET' as const, path: '/api/calendar', responses: { 200: z.array(z.custom<typeof calendarEvents.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/calendar', input: insertCalendarEventSchema, responses: { 201: z.custom<typeof calendarEvents.$inferSelect>(), 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/calendar/:id', input: insertCalendarEventSchema.partial(), responses: { 200: z.custom<typeof calendarEvents.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound } },
    delete: { method: 'DELETE' as const, path: '/api/calendar/:id', responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  partnerships: {
    list: { method: 'GET' as const, path: '/api/partnerships', responses: { 200: z.array(z.custom<typeof partnerships.$inferSelect>()) } },
    create: { method: 'POST' as const, path: '/api/partnerships', input: insertPartnershipSchema, responses: { 201: z.custom<typeof partnerships.$inferSelect>(), 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/partnerships/:id', input: insertPartnershipSchema.partial(), responses: { 200: z.custom<typeof partnerships.$inferSelect>(), 400: errorSchemas.validation } },
  },
  montadores: {
    list: { method: 'GET' as const, path: '/api/montadores', responses: { 200: z.array(z.custom<typeof profiles.$inferSelect>()) } },
  },
  assignments: {
    update: { method: 'PUT' as const, path: '/api/assignments/:id', input: z.object({ status: z.enum(assignmentStatusEnum.enumValues) }), responses: { 200: z.custom<typeof serviceAssignments.$inferSelect>(), 400: errorSchemas.validation, 404: errorSchemas.notFound } }
  },
  admin: {
    pendingProfiles: { method: 'GET' as const, path: '/api/admin/pending-profiles', responses: { 200: z.array(z.custom<typeof profiles.$inferSelect>()) } },
    approveProfile: { method: 'POST' as const, path: '/api/admin/approve-profile/:id', responses: { 200: z.custom<typeof profiles.$inferSelect>() } },
    blockProfile: { method: 'POST' as const, path: '/api/admin/block-profile/:id', responses: { 200: z.custom<typeof profiles.$inferSelect>() } },
    auditLogs: { method: 'GET' as const, path: '/api/admin/audit-logs', responses: { 200: z.array(z.any()) } },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
