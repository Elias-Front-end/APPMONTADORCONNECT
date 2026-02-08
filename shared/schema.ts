import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

// Enums
export const userRoleEnum = pgEnum("user_role", ["montador", "partner", "admin", "marcenaria", "lojista"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "active", "blocked"]);
export const serviceStatusEnum = pgEnum("service_status", [
  "draft", 
  "awaiting_montador", 
  "awaiting_team", 
  "in_progress", 
  "completed_pending_confirmation", 
  "completed_pending_evaluation", 
  "completed", 
  "cancelled_by_company", 
  "cancelled_by_admin"
]);
export const partnershipStatusEnum = pgEnum("partnership_status", ["pending", "active", "rejected", "blocked"]);
export const complexityLevelEnum = pgEnum("complexity_level", ["low", "medium", "high", "expert"]);
export const industryTypeEnum = pgEnum("industry_type", ["lojista", "marcenaria", "outros"]);
export const companySizeEnum = pgEnum("company_size", ["pequena", "media", "grande"]);
export const montadorLevelEnum = pgEnum("montador_level", ["iniciante", "intermediario", "avancado", "especialista"]);
export const fileTypeEnum = pgEnum("file_type", ["pdf", "video", "image", "other"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["invited", "accepted", "rejected", "removed"]);

// Profiles
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").default("montador").notNull(),
  status: userStatusEnum("status").default("pending").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  cpf: text("cpf").unique(),
  skills: text("skills").array(),
  experienceYears: integer("experience_years"),
  region: text("region"),
  companyId: integer("company_id"), 
  reputationScore: integer("reputation_score").default(0),
  level: montadorLevelEnum("level").default("iniciante"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").references(() => profiles.id).notNull(),
  tradingName: text("trading_name").notNull(),
  corporateName: text("corporate_name"),
  cnpj: text("cnpj").unique(),
  phone: text("phone"),
  emailContact: text("email_contact"),
  addressFull: text("address_full"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  industryType: industryTypeEnum("industry_type"),
  companySize: companySizeEnum("company_size"),
  isVerified: boolean("is_verified").default(false),
  settings: jsonb("settings").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").references(() => profiles.id).notNull(),
  serviceId: integer("service_id").references(() => (services as any).id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: text("type").notNull().default("appointment"), // e.g., 'appointment', 'availability', 'service'
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partnerships
export const partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  montadorId: text("montador_id").references(() => profiles.id).notNull(),
  status: partnershipStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  creatorId: text("creator_id").references(() => profiles.id),
  montadorId: text("montador_id").references(() => profiles.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  status: serviceStatusEnum("status").default("draft"),
  complexity: complexityLevelEnum("complexity").default("medium"),
  isUrgent: boolean("is_urgent").default(false),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  clientInfo: jsonb("client_info").$type<Record<string, any>>().default({}),
  addressFull: text("address_full").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  durationHours: integer("duration_hours"),
  price: integer("price"),
  requiredSkills: text("required_skills").array(),
  documents: text("documents").array(),
  serviceDetails: jsonb("service_details").$type<Record<string, any>>().default({}),
  requiredMontadoresCount: integer("required_montadores_count").default(1).notNull(),
  isClosed: boolean("is_closed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  minQualification: montadorLevelEnum("min_qualification").default("iniciante"),
});

// Service Attachments (PDFs, Videos)
export const serviceAttachments = pgTable("service_attachments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: fileTypeEnum("file_type").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Service Assignments (Team Management)
export const serviceAssignments = pgTable("service_assignments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  montadorId: text("montador_id").references(() => profiles.id).notNull(),
  status: assignmentStatusEnum("status").default("invited"),
  contractAccepted: boolean("contract_accepted").default(false),
  serviceRead: boolean("service_read").default(false),
  isLeader: boolean("is_leader").default(false),
  assignedAt: timestamp("assigned_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews (Qualificação e Score)
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  reviewerId: text("reviewer_id").references(() => profiles.id).notNull(), // Company or Client
  revieweeId: text("reviewee_id").references(() => profiles.id).notNull(), // Montador
  ratingQuality: integer("rating_quality").notNull(),
  ratingPunctuality: integer("rating_punctuality").notNull(),
  ratingCleanliness: integer("rating_cleanliness").notNull(),
  ratingProfessionalism: integer("rating_professionalism").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Governance Tables
export const flags = pgTable("flags", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").references(() => profiles.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  reason: text("reason").notNull(),
  severity: integer("severity").default(1), // 1: Info, 2: Warning, 3: Critical
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // e.g., 'service_accept', 'user_blocked', 'status_change'
  actorId: text("actor_id").references(() => profiles.id),
  targetId: text("target_id"), // flexible ID (user uuid, service id, etc)
  details: jsonb("details").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  company: one(companies, { fields: [profiles.companyId], references: [companies.id] }),
  ownedCompanies: many(companies, { relationName: "owner" }),
  partnerships: many(partnerships),
  assignedServices: many(services, { relationName: "montador" }),
  assignments: many(serviceAssignments),
  calendarEvents: many(calendarEvents),
  receivedReviews: many(reviews, { relationName: "reviewee" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  flags: many(flags),
  actions: many(auditLogs),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(profiles, { fields: [companies.ownerId], references: [profiles.id], relationName: "owner" }),
  partnerships: many(partnerships),
  services: many(services),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  profile: one(profiles, { fields: [calendarEvents.profileId], references: [profiles.id] }),
  service: one(services, { fields: [calendarEvents.serviceId], references: [services.id] }),
}));

export const partnershipsRelations = relations(partnerships, ({ one }) => ({
  company: one(companies, { fields: [partnerships.companyId], references: [companies.id] }),
  montador: one(profiles, { fields: [partnerships.montadorId], references: [profiles.id] }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  company: one(companies, { fields: [services.companyId], references: [companies.id] }),
  montador: one(profiles, { fields: [services.montadorId], references: [profiles.id], relationName: "montador" }),
  creator: one(profiles, { fields: [services.creatorId], references: [profiles.id], relationName: "creator" }),
  calendarEvents: many(calendarEvents),
  attachments: many(serviceAttachments),
  assignments: many(serviceAssignments),
  reviews: many(reviews),
}));

export const serviceAttachmentsRelations = relations(serviceAttachments, ({ one }) => ({
  service: one(services, { fields: [serviceAttachments.serviceId], references: [services.id] }),
}));

export const serviceAssignmentsRelations = relations(serviceAssignments, ({ one }) => ({
  service: one(services, { fields: [serviceAssignments.serviceId], references: [services.id] }),
  montador: one(profiles, { fields: [serviceAssignments.montadorId], references: [profiles.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  service: one(services, { fields: [reviews.serviceId], references: [services.id] }),
  reviewer: one(profiles, { fields: [reviews.reviewerId], references: [profiles.id], relationName: "reviewer" }),
  reviewee: one(profiles, { fields: [reviews.revieweeId], references: [profiles.id], relationName: "reviewee" }),
}));

// Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ 
  id: true, createdAt: true, updatedAt: true 
}).extend({
  cpf: z.string().nullable().optional().transform(val => val ? val.replace(/\D/g, "") : (val === undefined ? null : val)),
  phone: z.string().nullable().optional().transform(val => val ? val.replace(/\D/g, "") : (val === undefined ? null : val)),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ 
  id: true, createdAt: true, updatedAt: true 
}).extend({
  cnpj: z.string().nullable().transform(val => val ? val.replace(/\D/g, "") : val),
  phone: z.string().nullable().transform(val => val ? val.replace(/\D/g, "") : val),
});
export const insertPartnershipSchema = createInsertSchema(partnerships).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  completedAt: z.coerce.date().optional().nullable(),
});
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceAttachmentSchema = createInsertSchema(serviceAttachments).omit({ id: true, uploadedAt: true });
export const insertServiceAssignmentSchema = createInsertSchema(serviceAssignments).omit({ id: true, assignedAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertFlagSchema = createInsertSchema(flags).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Partnership = typeof partnerships.$inferSelect;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type ServiceAttachment = typeof serviceAttachments.$inferSelect;
export type InsertServiceAttachment = z.infer<typeof insertServiceAttachmentSchema>;
export type ServiceAssignment = typeof serviceAssignments.$inferSelect;
export type InsertServiceAssignment = z.infer<typeof insertServiceAssignmentSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Flag = typeof flags.$inferSelect;
export type InsertFlag = z.infer<typeof insertFlagSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
