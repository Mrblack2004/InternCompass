import { storage } from "./storage";
import { ProgressCalculator } from "./progress-calculator";

export class DailyTimer {
  private static instance: DailyTimer;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): DailyTimer {
    if (!DailyTimer.instance) {
      DailyTimer.instance = new DailyTimer();
    }
    return DailyTimer.instance;
  }

  start() {
    // Run every hour to check for internship completion
    this.intervalId = setInterval(async () => {
      await this.checkInternshipCompletion();
    }, 60 * 60 * 1000); // 1 hour

    // Also run immediately
    this.checkInternshipCompletion();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkInternshipCompletion() {
    try {
      const allInterns = await storage.getAllInterns();
      const today = new Date();

      for (const intern of allInterns) {
        if (!intern.isActive) continue;

        const endDate = new Date(intern.endDate);
        
        // Check if internship has ended
        if (today >= endDate) {
          // Mark intern as inactive
          await storage.updateIntern(intern.id, { isActive: false });
          
          // Generate certificate if eligible
          await ProgressCalculator.generateCertificateIfEligible(intern.id);
          
          console.log(`Internship completed for ${intern.name}`);
        }
      }
    } catch (error) {
      console.error("Error checking internship completion:", error);
    }
  }

  // Method to manually mark attendance for an intern
  static async markAttendance(internId: string): Promise<void> {
    try {
      const intern = await storage.getIntern(internId);
      if (!intern || !intern.isActive) return;

      await storage.updateIntern(internId, {
        attendanceCount: intern.attendanceCount + 1
      });

      // Recalculate progress
      await ProgressCalculator.calculateInternProgress(internId);
      
      console.log(`Attendance marked for intern ${intern.name}`);
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  }
}