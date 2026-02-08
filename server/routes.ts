import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { serviceStatusEnum } from "@shared/schema";
import multer from "multer";
import fs from "fs";
import path from "path";
import express from "express";
import { requireAuth } from "./middleware/auth";
import { validateRole, sanitizeProfileInput } from "./utils/profile-utils";

import { GovernanceService } from "./services/governance-service";
import { ServiceLifecycle } from "./services/service-lifecycle";
import { createLogger } from "./logger";

const logger = createLogger("Routes");

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storageConfig });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Setup Auth
  setupAuth(app);

  // Profiles
  app.get(api.profiles.me.path, requireAuth, async (req, res, next) => {
    const user = req.user as any;
    logger.debug(`Fetching profile for user: ${user.username} (ID: ${user.id})`);
    try {
      const profile = await storage.getProfile(user.id); // user.id comes from auth table, which is string UUID
      if (!profile) {
        logger.warn(`Profile not found for user: ${user.id}`);
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (err) {
      logger.error(`Error fetching profile for user ${user.id}:`, err);
      next(err);
    }
  });

  app.post(api.profiles.create.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    logger.info(`Creating profile for user: ${user.username} (ID: ${user.id})`);
    
    try {
      const input = api.profiles.create.input.parse({ ...req.body, id: user.id }); // force ID match
      
      // Security check for role
      if (input.role && !validateRole(input.role)) {
         logger.warn(`Invalid role attempt: ${input.role} for user ${user.id}`);
         return res.status(403).json({ message: "Tipo de perfil inválido ou não permitido." });
      }

      // Sanitize input
      const sanitized = sanitizeProfileInput(input);

      const profile = await storage.createProfile({ ...sanitized, id: user.id } as any);
      logger.info(`Profile created successfully for user ${user.id}`);
      res.status(201).json(profile);
    } catch (err) {
      // Handle unique constraint violation specifically
      if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
          logger.warn(`CPF duplicate error for user ${user.id}`);
          return res.status(409).json({ message: "Este CPF já está cadastrado em outra conta." });
      }

      if (err instanceof z.ZodError) {
        logger.warn(`Validation error creating profile for user ${user.id}:`, err.errors);
        return res.status(400).json({ message: err.errors[0].message });
      }
      logger.error(`Error creating profile for user ${user.id}:`, err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.profiles.update.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    logger.info(`Updating profile for user: ${user.username} (ID: ${user.id})`);
    
    try {
      const input = api.profiles.update.input.parse(req.body);
      
      // Security check for role: Prevent escalation to admin
      if (input.role && !validateRole(input.role)) {
         logger.warn(`Invalid role update attempt: ${input.role} for user ${user.id}`);
         return res.status(403).json({ message: "Tipo de perfil inválido ou não permitido." });
      }

      // Sanitize input
      const sanitized = sanitizeProfileInput(input);

      const profile = await storage.updateProfile(user.id, sanitized);
      logger.info(`Profile updated successfully for user ${user.id}`);
      res.json(profile);

    } catch (err) {
      // Handle unique constraint violation specifically
      if (err instanceof Error && 'code' in err && err.code === '23505') {
         return res.status(409).json({ message: "Este CPF já está cadastrado em outra conta." });
      }

      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      logger.error("Error updating profile:", err);
      res.status(500).json({ message: "Erro interno ao atualizar perfil" });
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
    if (!profile) return res.status(400).json({ message: "Crie um perfil primeiro." });

    // Check if user already has a company
    const existingCompany = await storage.getCompanyByOwner(user.id);
    if (existingCompany) {
      return res.status(400).json({ message: "Você já possui uma empresa cadastrada." });
    }

    try {
      const input = api.companies.create.input.parse({ ...req.body, ownerId: user.id });
      const company = await storage.createCompany(input);
      // Update profile with companyId
      await storage.updateProfile(user.id, { companyId: company.id });
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof Error && 'code' in err && (err as any).code === '23505') {
        const target = (err as any).constraint;
        if (target?.includes('cnpj')) {
          return res.status(409).json({ message: "Este CNPJ já está cadastrado." });
        }
        return res.status(409).json({ message: "Dados duplicados (CNPJ ou outro campo único)." });
      }
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      logger.error("Error creating company:", err);
      res.status(500).json({ message: "Erro interno ao criar empresa" });
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
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const profile = await storage.getProfile(user.id);
    
    // Parse query
    const status = req.query.status as string | undefined;
    const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    
    // Validate status enum
    const validStatus = status && serviceStatusEnum.enumValues.includes(status as any) ? status : undefined;
    
    const services = await storage.getServices({ 
      status: validStatus, 
      companyId,
      userId: user.id,
      userRole: profile?.role,
      montadorLevel: profile?.level || undefined
    });
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

      const service = await storage.createService({ 
        ...input, 
        companyId: profile.companyId,
        creatorId: user.id,
        status: "awaiting_montador" // MVP default for new services
      });
      
      await GovernanceService.logAction("service_created", user.id, String(service.id));
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
    
    try {
      const serviceId = Number(req.params.id);
      const service = await storage.getService(serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      const user = req.user as any;
      const profile = await storage.getProfile(user.id);
      
      // Ownership check: only creator or company owner
      if (service.creatorId !== user.id && service.companyId !== profile?.companyId) {
          return res.status(403).json({ message: "Not authorized to update this service" });
      }

      const input = api.services.update.input.parse(req.body);
      const updated = await storage.updateService(serviceId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.services.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if service exists
    const service = await storage.getService(Number(req.params.id));
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Check ownership
    const user = req.user as any;
    const profile = await storage.getProfile(user.id);
    
    if (service.creatorId !== user.id && service.companyId !== profile?.companyId) {
        return res.status(403).json({ message: "Not authorized to delete this service" });
    }

    try {
      await storage.deleteService(service.id);
      res.sendStatus(204);
    } catch (err) {
      logger.error("Error deleting service:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Service Attachments
  app.get(api.services.getAttachments.path, async (req, res) => {
    const attachments = await storage.getServiceAttachments(Number(req.params.id));
    res.json(attachments);
  });

  app.post(api.services.addAttachment.path, upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const serviceId = Number(req.params.id);
      const attachment = await storage.createServiceAttachment({
        serviceId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : req.file.mimetype.includes('video') ? 'video' : 'other',
        fileUrl: `/uploads/${req.file.filename}`
      });
      res.status(201).json(attachment);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Service Assignments
  app.get(api.services.getAssignments.path, async (req, res) => {
    const assignments = await storage.getServiceAssignments(Number(req.params.id));
    res.json(assignments);
  });

  app.post(api.services.assign.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const serviceId = Number(req.params.id);
      const service = await storage.getService(serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      const input = api.services.assign.input.parse({ ...req.body, serviceId });
      
      // MVP logic: check if already assigned
      const existing = await storage.getServiceAssignments(serviceId);
      if (existing.find((a: any) => a.montadorId === input.montadorId)) {
        return res.status(400).json({ message: "Already applied to this service" });
      }

      const assignment = await storage.createServiceAssignment({
        ...input,
        status: "accepted", // In MVP, if it's open, montador "accepts" it
        contractAccepted: true,
        serviceRead: true
      });

      await GovernanceService.logAction("service_accepted", input.montadorId, String(serviceId));
      
      // Trigger team formation check
      await ServiceLifecycle.checkTeamFormation(serviceId, input.montadorId);
      
      res.status(201).json(assignment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Completion confirmation
  app.post("/api/services/:id/confirm-completion", requireAuth, async (req, res) => {
    try {
      const serviceId = Number(req.params.id);
      const user = req.user as any;
      const profile = await storage.getProfile(user.id);
      
      if (!profile) return res.status(404).json({ message: "Profile not found" });

      const side = profile.role === "montador" ? "montador" : "company";
      await ServiceLifecycle.confirmCompletion(serviceId, user.id, side);
      
      res.json({ message: "Completion confirmed" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Admin: Moderation & Governance
  app.get("/api/admin/pending-profiles", requireAuth, async (req, res) => {
    const user = req.user as any;
    const profile = await storage.getProfile(user.id);
    if (profile?.role !== "admin") return res.sendStatus(403);
    
    const pending = await storage.getPendingProfiles();
    res.json(pending);
  });

  app.post("/api/admin/approve-profile/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    const adminProfile = await storage.getProfile(user.id);
    if (adminProfile?.role !== "admin") return res.sendStatus(403);
    
    const profileId = String(req.params.id);
    const updated = await storage.updateProfile(profileId, { status: "active" });
    await GovernanceService.logAction("profile_approved", user.id, profileId);
    res.json(updated);
  });

  app.post("/api/admin/block-profile/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    const adminProfile = await storage.getProfile(user.id);
    if (adminProfile?.role !== "admin") return res.sendStatus(403);
    
    const profileId = String(req.params.id);
    const updated = await storage.updateProfile(profileId, { status: "blocked" });
    await GovernanceService.logAction("profile_blocked", user.id, profileId);
    res.json(updated);
  });

  app.get("/api/admin/audit-logs", requireAuth, async (req, res) => {
    const user = req.user as any;
    const adminProfile = await storage.getProfile(user.id);
    if (adminProfile?.role !== "admin") return res.sendStatus(403);
    
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });

  // Montadores Listing
  app.get(api.montadores.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const montadores = await storage.getProfilesByRole('montador');
      res.json(montadores);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Reviews
  app.get(api.services.getReviews.path, async (req, res) => {
    res.json([]);
  });

  app.post(api.services.addReview.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    try {
      const input = api.services.addReview.input.parse({ ...req.body, serviceId: Number(req.params.id), reviewerId: user.id });
      const review = await storage.createReview(input);
      res.status(201).json(review);
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
