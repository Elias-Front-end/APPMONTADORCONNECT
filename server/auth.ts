import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { pool } from "./db";
import { User as DbUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { createLogger } from "./logger";
import { authLimiter } from "./middleware/rate-limit";

const logger = createLogger("Auth");

// Extend Express Request type to include Passport methods
declare global {
  namespace Express {
    interface User extends DbUser {} // Merge with our User type
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Valida a força da senha
 * Requisitos: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
 */
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter pelo menos 8 caracteres" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número" };
  }
  return { valid: true };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  logger.info("Setting up authentication...");
  
  // Validar que SESSION_SECRET está definido
  if (!process.env.SESSION_SECRET) {
    const errorMsg = 'SECURITY ERROR: SESSION_SECRET must be defined in environment variables';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool, // Use the existing pool
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: app.get("env") === "production",
        maxAge: sessionTtl,
        httpOnly: true, // Previne acesso via JavaScript
        sameSite: 'lax', // Proteção contra CSRF
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username: string, password: string, done: (err: any, user?: any) => void) => {
      logger.debug(`Attempting login for user: ${username}`);
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          logger.warn(`Login failed: User not found for username: ${username}`);
          return done(null, false);
        }
        if (!(await comparePasswords(password, user.password))) {
          logger.warn(`Login failed: Invalid password for user: ${username}`);
          return done(null, false);
        }
        logger.info(`Login successful for user: ${username} (ID: ${user.id})`);
        return done(null, user);
      } catch (err) {
        logger.error(`Login error for user ${username}:`, err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done: (err: any, id?: unknown) => void) => {
    logger.debug(`Serializing user: ${user.id}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | null) => void) => {
    logger.debug(`Deserializing user: ${id}`);
    try {
      const user = await storage.getUser(id);
      if (!user) {
        logger.warn(`Deserialize failed: User not found for ID: ${id}`);
        return done(null, null); // Explicitly return null if user not found
      }
      done(null, user);
    } catch (err) {
      logger.error(`Deserialize error for ID ${id}:`, err);
      done(err);
    }
  });

  app.post("/api/register", authLimiter, async (req, res, next) => {
    logger.info(`Registration attempt for username: ${req.body.username}`);
    try {
      if (!req.body.username || !req.body.password) {
        logger.warn("Registration failed: Missing username or password");
        return res.status(400).send("Username and password are required");
      }

      // Validar força da senha
      const passwordValidation = validatePasswordStrength(req.body.password);
      if (!passwordValidation.valid) {
        logger.warn(`Registration failed: Weak password for username: ${req.body.username}`);
        return res.status(400).send(passwordValidation.message);
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        logger.warn(`Registration failed: Username already exists: ${req.body.username}`);
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
      
      logger.info(`User created successfully: ${user.username} (ID: ${user.id})`);

      // Create initial profile with selected role
      if (req.body.role) {
        try {
          logger.debug(`Creating initial profile for user ${user.id} with role ${req.body.role}`);
          // Map "marcenaria" to "marcenaria" or "lojista" role, or generalize as "partner" if needed
          // For now, let's use the enum values directly. 
          // If user selected "empresa" (marcenaria in value), we store that.
          const role = req.body.role === 'marcenaria' ? 'marcenaria' : 'montador';
          
          await storage.createProfile({
            id: user.id,
            role: role,
            // Default empty values
            fullName: "",
            phone: "",
            avatarUrl: null,
            bio: "",
            cpf: null,
            skills: [],
            experienceYears: 0,
            region: "",
            companyId: null,
            reputationScore: 0,
            level: 'iniciante'
          });
          logger.info(`Initial profile created for user ${user.id}`);
        } catch (profileErr) {
          logger.error("Failed to create initial profile:", profileErr);
          // Non-fatal, user can create profile later
        }
      }

      req.login(user, (err: any) => {
        if (err) {
          logger.error("Login after registration failed:", err);
          return next(err);
        }
        logger.info(`User logged in after registration: ${user.username}`);
        res.status(201).json(user);
      });
    } catch (err) {
      logger.error("Registration error:", err);
      next(err);
    }
  });

  app.post("/api/login", authLimiter, (req, res, next) => {
    logger.debug("Login request received");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        logger.error("Passport authenticate error:", err);
        return next(err);
      }
      if (!user) {
        logger.warn("Authentication failed (no user returned)");
        return res.status(401).send("Invalid credentials");
      }
      req.login(user, (err) => {
        if (err) {
          logger.error("req.login error:", err);
          return next(err);
        }
        logger.info(`Session established for user: ${user.username}`);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const userId = (req.user as any)?.id;
    logger.info(`Logout request for user ID: ${userId}`);
    req.logout((err: any) => {
      if (err) {
        logger.error("Logout error:", err);
        return next(err);
      }
      logger.info("Logout successful");
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      // Don't log this as error/warn, it's common for initial load
      // logger.debug("User check: Not authenticated");
      return res.sendStatus(401);
    }
    logger.debug(`User check: Authenticated as ${(req.user as any).username}`);
    res.json(req.user);
  });
}
