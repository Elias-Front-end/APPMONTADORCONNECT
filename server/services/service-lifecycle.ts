import { storage } from "../storage";
import { GovernanceService } from "./governance-service";
import { type Service, type ServiceAssignment } from "@shared/schema";
import { createLogger } from "../logger";

const logger = createLogger("ServiceLifecycle");

export class ServiceLifecycle {
  /**
   * Transition service to a new status with validation and logging.
   */
  static async transitionStatus(serviceId: number, nextStatus: string, actorId: string, details: any = {}) {
    const service = await storage.getService(serviceId);
    if (!service) throw new Error("Service not found");

    logger.info(`Transitioning service ${serviceId} from ${service.status} to ${nextStatus}`);

    const updated = await storage.updateService(serviceId, { 
      status: nextStatus as any
    });

    await GovernanceService.logAction("service_status_change", actorId, String(serviceId), {
      from: service.status,
      to: nextStatus,
      ...details
    });

    return updated;
  }

  /**
   * Check if team is full and transition to awaiting_team or in_progress?
   * MVP Scope: 
   * - published -> awaiting_montador
   * - When one accepts -> awaiting_team (if count > 1) 
   * - When all accept -> (Formed)
   */
  static async checkTeamFormation(serviceId: number, actorId: string) {
    const service = await storage.getService(serviceId);
    if (!service) return;

    const assignments = await storage.getServiceAssignments(serviceId);
    const acceptedAssignments = assignments.filter((a: any) => a.status === "accepted");

    if (acceptedAssignments.length >= service.requiredMontadoresCount) {
      if (service.status === "awaiting_montador" || service.status === "awaiting_team") {
        await this.transitionStatus(serviceId, "in_progress", actorId, { reason: "team_formed" });
        await storage.updateService(serviceId, { isClosed: true });
      }
    } else if (acceptedAssignments.length > 0 && service.status === "awaiting_montador") {
       await this.transitionStatus(serviceId, "awaiting_team", actorId, { currentCount: acceptedAssignments.length });
    }
  }

  /**
   * Handles completion confirmation from one side.
   */
  static async confirmCompletion(serviceId: number, actorId: string, side: "montador" | "company") {
    const service = await storage.getService(serviceId);
    if (!service) throw new Error("Service not found");

    if (service.status !== "in_progress" && service.status !== "completed_pending_confirmation") {
      throw new Error("Invalid status for completion confirmation");
    }

    if (service.status === "in_progress") {
      await this.transitionStatus(serviceId, "completed_pending_confirmation", actorId, { confirmedBy: side });
    } else if (service.status === "completed_pending_confirmation") {
      // Check who confirmed first in audit logs or a pending_confirmation_by field?
      // For MVP simplify: if it's already pending, and this is a different side, complete it.
      // But let's check details of the last audit log for this service.
      const logs = await storage.getAuditLogs();
      const lastStatusLog = logs.reverse().find(l => l.action === "service_status_change" && l.targetId === String(serviceId));
      
      const alreadyConfirmedBy = (lastStatusLog?.details as any)?.confirmedBy;
      
      if (alreadyConfirmedBy && alreadyConfirmedBy !== side) {
         await this.transitionStatus(serviceId, "completed_pending_evaluation", actorId, { reason: "double_confirmation_complete" });
         await storage.updateService(serviceId, { completedAt: new Date() });
      } else {
         // Same side confirming again? or just ignore
         logger.info(`Side ${side} confirmed again or same side.`);
      }
    }
  }
}
