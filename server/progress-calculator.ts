import { storage } from "./storage";
import type { User, Task } from "@shared/schema";

export class ProgressCalculator {
  /**
   * Calculate overall progress percentage for a user based on completed tasks and attendance
   */
  static async calculateUserProgress(userId: string): Promise<number> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return 0;

      const tasks = await storage.getTasksByUser(userId);
      if (tasks.length === 0) return 0;
      
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      const taskProgress = (completedTasks / tasks.length) * 80; // 80% weight for tasks
      
      // Attendance contributes 20% to overall progress
      const attendanceProgress = Math.min(user.attendanceCount / 30, 1) * 20; // Max 30 days
      
      const totalProgress = Math.round(taskProgress + attendanceProgress);
      
      // Update user progress in database
      await storage.updateUser(userId, { progress: totalProgress });
      
      return totalProgress;
    } catch (error) {
      console.error("Error calculating user progress:", error);
      return 0;
    }
  }

  /**
   * Calculate team progress statistics
   */
  static calculateTeamProgress(teamTasks: Task[]) {
    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(task => task.status === "completed").length;
    const inProgressTasks = teamTasks.filter(task => task.status === "in_progress").length;
    const pendingTasks = teamTasks.filter(task => task.status === "pending").length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }

  /**
   * Check if user is eligible for certificate based on progress
   */
  static async isEligibleForCertificate(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return false;

      const tasks = await storage.getTasksByUser(userId);
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      const minimumAttendance = 20; // minimum days
      
      return taskCompletionRate >= 80 && user.attendanceCount >= minimumAttendance;
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      return false;
    }
  }

  /**
   * Generate certificate for eligible users
   */
  static async generateCertificateIfEligible(userId: string): Promise<void> {
    try {
      const isEligible = await this.isEligibleForCertificate(userId);
      if (!isEligible) return;

      const certificate = await storage.getCertificateByUser(userId);
      if (!certificate || certificate.isGenerated) return;

      const user = await storage.getUser(userId);
      if (!user) return;

      // Generate certificate
      await storage.updateCertificate(certificate.id, {
        isGenerated: true,
        issuedDate: new Date().toISOString().split('T')[0],
        certificateUrl: `/certificates/${certificate.id}.pdf`,
      });

      // Create notification
      await storage.createNotification({
        userId: userId,
        type: "certificate_ready",
        title: "Certificate Ready!",
        message: "Congratulations! Your internship certificate is now ready for download.",
        isRead: false,
      });

      console.log(`Certificate generated for user: ${user.name}`);
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  }

  /**
   * Get progress summary for dashboard display
   */
  static async getProgressSummary(userId: string) {
    try {
      const user = await storage.getUser(userId);
      if (!user) return null;

      const tasks = await storage.getTasksByUser(userId);
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      const activeTasks = tasks.filter(task => task.status !== "completed").length;

      return {
        progress: user.progress,
        completedTasks,
        activeTasks,
        totalTasks: tasks.length,
        attendanceDays: user.attendanceCount,
        isEligibleForCertificate: await this.isEligibleForCertificate(userId)
      };
    } catch (error) {
      console.error("Error getting progress summary:", error);
      return null;
    }
  }
}