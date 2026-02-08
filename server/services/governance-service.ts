import { storage } from "../storage";
import { type InsertAuditLog, type InsertFlag } from "@shared/schema";
import { createLogger } from "../logger";

const logger = createLogger("GovernanceService");

export class GovernanceService {
  static async logAction(action: string, actorId: string | null, targetId: string | null, details: any = {}) {
    try {
      await storage.createAuditLog({
        action,
        actorId: actorId || null,
        targetId: targetId ? String(targetId) : null,
        details
      });
      logger.info(`AuditLog [${action}] by actor: ${actorId} on target: ${targetId}`);
    } catch (err) {
      logger.error(`Failed to create audit log:`, err);
    }
  }

  static async reportFlag(profileId: string, reason: string, severity: number = 1, serviceId?: number) {
    try {
      const flag = await storage.createFlag({
        profileId,
        reason,
        severity,
        serviceId: serviceId || null
      });

      // Check for automatic blocking threshold (MVP Scope: 5 flags recommendation, here we just log or notify admin)
      const userFlags = await storage.getFlags(profileId);
      if (userFlags.length >= 5) {
        logger.warn(`User ${profileId} has reached 5 flags. Recommend manual review for blocking.`);
        await this.logAction("flag_threshold_reached", null, profileId, { count: userFlags.length });
      }

      return flag;
    } catch (err) {
      logger.error(`Failed to create flag:`, err);
    }
  }
}
