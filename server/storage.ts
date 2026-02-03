import { 
  users, profiles, companies, services, partnerships,
  type User, type InsertUser,
  type Profile, type InsertProfile,
  type Company, type InsertCompany,
  type Service, type InsertService,
  type Partnership,
  serviceStatusEnum
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
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

  // Partnerships
  getPartnerships(): Promise<Partnership[]>;
  createPartnership(partnership: any): Promise<Partnership>;
  updatePartnership(id: number, partnership: any): Promise<Partnership>;
}

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
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
}

export const storage = new DatabaseStorage();
