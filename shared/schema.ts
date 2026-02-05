import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

// Enums
export const userRoleEnum = pgEnum("user_role", ["montador", "partner", "admin", "marcenaria", "lojista"]);
export const serviceStatusEnum = pgEnum("service_status", ["draft", "published", "scheduled", "in_progress", "completed", "cancelled", "disputed"]);
export const partnershipStatusEnum = pgEnum("partnership_status", ["pending", "active", "rejected", "blocked"]);
export const complexityLevelEnum = pgEnum("complexity_level", ["low", "medium", "high", "expert"]);
export const montadorLevelEnum = pgEnum("montador_level", ["iniciante", "intermediario", "avancado", "especialista"]);
export const projectCategoryEnum = pgEnum("project_category", ["moveis_planejados", "cozinhas", "quartos", "escritorios", "comercial", "montagem_geral"]);

// Profiles
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").default("montador").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  cpf: text("cpf").unique(),
  skills: text("skills").array(),
  experienceYears: integer("experience_years"),
  region: text("region"),
  companyId: integer("company_id"), 
  score: integer("score").default(0),
  level: montadorLevelEnum("level").default("iniciante"),
  completedServices: integer("completed_services").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").references(() => profiles.id).notNull(),
  tradingName: text("trading_name").notNull(), // Nome Fantasia
  corporateName: text("corporate_name"), // Razão Social
  cnpj: text("cnpj").unique(),
  phone: text("phone"),
  emailContact: text("email_contact"),
  addressFull: text("address_full"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  segment: text("segment"), // Ramo de atuação (logista, marcenaria)
  size: text("size"), // Porte da empresa
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
  category: projectCategoryEnum("category").default("montagem_geral"),
  status: serviceStatusEnum("status").default("draft"),
  complexity: complexityLevelEnum("complexity").default("medium"),
  minQualification: montadorLevelEnum("min_qualification").default("iniciante"),
  isUrgent: boolean("is_urgent").default(false),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  clientInfo: jsonb("client_info").$type<Record<string, any>>().default({}),
  addressFull: text("address_full").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  durationHours: integer("duration_hours"),
  price: integer("price"), // Valor em centavos
  requiredSkills: text("required_skills").array(),
  documents: text("documents").array(), // URLs de PDFs
  videos: text("videos").array(), // URLs de vídeos
  serviceDetails: jsonb("service_details").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  reviewerId: text("reviewer_id").references(() => profiles.id).notNull(),
  targetId: text("target_id").references(() => profiles.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  quality: integer("quality"), // 1-5
  punctuality: integer("punctuality"), // 1-5
  cleanliness: integer("cleanliness"), // 1-5
  professionalism: integer("professionalism"), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  company: one(companies, { fields: [profiles.companyId], references: [companies.id] }),
  ownedCompanies: many(companies, { relationName: "owner" }),
  partnerships: many(partnerships),
  assignedServices: many(services, { relationName: "montador" }),
  calendarEvents: many(calendarEvents),
  reviewsWritten: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "target" }),
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
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  service: one(services, { fields: [reviews.serviceId], references: [services.id] }),
  reviewer: one(profiles, { fields: [reviews.reviewerId], references: [profiles.id], relationName: "reviewer" }),
  target: one(profiles, { fields: [reviews.targetId], references: [profiles.id], relationName: "target" }),
}));

// Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartnershipSchema = createInsertSchema(partnerships).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

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
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
