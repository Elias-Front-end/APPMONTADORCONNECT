import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { serviceStatusEnum } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Profiles
  app.get(api.profiles.me.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const profile = await storage.getProfile(user.id); // user.id comes from auth table, which is string UUID
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.post(api.profiles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    try {
      const input = api.profiles.create.input.parse({ ...req.body, id: user.id }); // force ID match
      const profile = await storage.createProfile(input);
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.profiles.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    try {
      const input = api.profiles.update.input.parse(req.body);
      const profile = await storage.updateProfile(user.id, input);
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Companies
  app.get(api.companies.list.path, async (req, res) => {
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.get(api.companies.get.path, async (req, res) => {
    const company = await storage.getCompany(Number(req.params.id));
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  });

  app.post(api.companies.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    // Check if user already owns a company or just allow multiple? 
    // Schema doesn't enforce unique owner, but usually 1-1 for MVP.
    // Let's enforce 1 company per user for now in logic if needed, but storage allows multiple.
    
    // Ensure the profile exists first
    const profile = await storage.getProfile(user.id);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });

    try {
      const input = api.companies.create.input.parse({ ...req.body, ownerId: user.id });
      const company = await storage.createCompany(input);
      // Update profile with companyId
      await storage.updateProfile(user.id, { companyId: company.id });
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.companies.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const company = await storage.getCompany(Number(req.params.id));
    
    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.ownerId !== user.id) return res.sendStatus(403);

    try {
      const input = api.companies.update.input.parse(req.body);
      const updated = await storage.updateCompany(company.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    // Parse query
    const status = req.query.status as string | undefined;
    const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    
    // Validate status enum
    const validStatus = status && serviceStatusEnum.enumValues.includes(status as any) ? status : undefined;
    
    const services = await storage.getServices({ status: validStatus, companyId });
    res.json(services);
  });

  app.get(api.services.get.path, async (req, res) => {
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    
    // Check if user has a company (must be a partner/company owner to create services usually)
    const profile = await storage.getProfile(user.id);
    if (!profile?.companyId) return res.status(400).json({ message: "Must belong to a company to create services" });

    try {
      const input = api.services.create.input.parse({ 
        ...req.body, 
        companyId: profile.companyId,
        creatorId: user.id
      });
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.services.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Add logic to check ownership or assignment
    try {
      const input = api.services.update.input.parse(req.body);
      const service = await storage.updateService(Number(req.params.id), input);
      res.json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Partnerships
  app.get(api.partnerships.list.path, async (req, res) => {
    const partnerships = await storage.getPartnerships();
    res.json(partnerships);
  });

  app.post(api.partnerships.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.partnerships.create.input.parse(req.body);
      const partnership = await storage.createPartnership(input);
      res.status(201).json(partnership);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.partnerships.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.partnerships.update.input.parse(req.body);
      const partnership = await storage.updatePartnership(Number(req.params.id), input);
      res.json(partnership);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
