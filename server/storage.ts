import { 
  users, profiles, companies, services, partnerships, calendarEvents,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Company, type InsertCompany,
  type Service, type InsertService,
  type Partnership,
  type CalendarEvent, type InsertCalendarEvent,
  serviceStatusEnum,
  type ServiceAttachment, type InsertServiceAttachment, serviceAttachments,
  type ServiceAssignment, type InsertServiceAssignment, serviceAssignments,
  type Review, type InsertReview, reviews
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile & { id: string }): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile>;

  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByOwner(ownerId: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;

  // Services
  getServices(filters?: { status?: string, companyId?: number }): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;

  // Service Attachments
  getServiceAttachments(serviceId: number): Promise<ServiceAttachment[]>;
  createServiceAttachment(attachment: InsertServiceAttachment): Promise<ServiceAttachment>;

  // Service Assignments
  getServiceAssignments(serviceId: number): Promise<ServiceAssignment[]>;
  createServiceAssignment(assignment: InsertServiceAssignment): Promise<ServiceAssignment>;
  updateServiceAssignment(id: number, status: string): Promise<ServiceAssignment>;

  // Reviews
  getReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Partnerships
  getPartnerships(): Promise<Partnership[]>;
  createPartnership(partnership: any): Promise<Partnership>;
  updatePartnership(id: number, partnership: any): Promise<Partnership>;

  // Calendar
  getCalendarEvents(profileId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profiles
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile & { id: string }): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(id: string, updateProfile: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updateProfile, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByOwner(ownerId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.ownerId, ownerId));
    return company;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updateCompany: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updateCompany, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Services
  async getServices(filters?: { status?: string, companyId?: number }): Promise<Service[]> {
    let query = db.select().from(services);
    const conditions = [];
    
    if (filters?.status) {
      // @ts-ignore
      conditions.push(eq(services.status, filters.status));
    }
    if (filters?.companyId) {
      conditions.push(eq(services.companyId, filters.companyId));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, updateService: Partial<InsertService>): Promise<Service> {
    const [service] = await db
      .update(services)
      .set({ ...updateService, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  // Service Attachments
  async getServiceAttachments(serviceId: number): Promise<ServiceAttachment[]> {
    return await db.select().from(serviceAttachments).where(eq(serviceAttachments.serviceId, serviceId));
  }

  async createServiceAttachment(insertAttachment: InsertServiceAttachment): Promise<ServiceAttachment> {
    const [attachment] = await db.insert(serviceAttachments).values(insertAttachment).returning();
    return attachment;
  }

  // Service Assignments
  async getServiceAssignments(serviceId: number): Promise<ServiceAssignment[]> {
    return await db.select().from(serviceAssignments).where(eq(serviceAssignments.serviceId, serviceId));
  }

  async createServiceAssignment(insertAssignment: InsertServiceAssignment): Promise<ServiceAssignment> {
    const [assignment] = await db.insert(serviceAssignments).values(insertAssignment).returning();
    return assignment;
  }

  async updateServiceAssignment(id: number, status: string): Promise<ServiceAssignment> {
    // @ts-ignore
    const [assignment] = await db.update(serviceAssignments)
      // @ts-ignore
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceAssignments.id, id))
      .returning();
    return assignment;
  }

  // Reviews
  async getReviews(userId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.revieweeId, userId));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  // Partnerships
  async getPartnerships(): Promise<Partnership[]> {
    return await db.select().from(partnerships);
  }

  async createPartnership(insertPartnership: any): Promise<Partnership> {
    const [partnership] = await db.insert(partnerships).values(insertPartnership).returning();
    return partnership;
  }

  async updatePartnership(id: number, updatePartnership: any): Promise<Partnership> {
    const [partnership] = await db
      .update(partnerships)
      .set({ ...updatePartnership, updatedAt: new Date() })
      .where(eq(partnerships.id, id))
      .returning();
    return partnership;
  }

  // Calendar
  async getCalendarEvents(profileId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.profileId, profileId));
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db.insert(calendarEvents).values(insertEvent).returning();
    return event;
  }

  async updateCalendarEvent(id: number, updateEvent: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const [event] = await db
      .update(calendarEvents)
      .set({ ...updateEvent, updatedAt: new Date() })
      .where(eq(calendarEvents.id, id))
      .returning();
    return event;
  }

  async deleteCalendarEvent(id: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }
}

export const storage = new DatabaseStorage();
