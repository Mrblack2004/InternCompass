import type { User, Task } from "@shared/schema";

export class ProgressCalculator {
  /**
   * Calculate overall progress percentage for a user based on completed tasks
   */
  static calculateUserProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Calculate team progress statistics
   */
  static calculateTeamProgress(teamTasks: Task[]) {
    const totalTasks = teamTasks.length;
    const completedTasks = teamTasks.filter(task => task.status === "completed").length;
    const inProgressTasks = teamTasks.filter(task => task.status === "in-progress").length;
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
  static isEligibleForCertificate(user: User, tasks: Task[]): boolean {
    const progress = this.calculateUserProgress(tasks);
    const minimumAttendance = 20; // minimum days
    
    return progress >= 80 && user.attendanceCount >= minimumAttendance;
  }

  /**
   * Generate certificate data for eligible users
   */
  static generateCertificateData(user: User, tasks: Task[]) {
    if (!this.isEligibleForCertificate(user, tasks)) {
      throw new Error("User is not eligible for certificate");
    }

    const progress = this.calculateUserProgress(tasks);
    const completedTasks = tasks.filter(task => task.status === "completed").length;

    return {
      userName: user.name,
      department: user.department,
      startDate: user.startDate,
      endDate: user.endDate,
      progress,
      completedTasks,
      attendanceDays: user.attendanceCount,
      issueDate: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Get progress summary for dashboard display
   */
  static getProgressSummary(user: User, tasks: Task[]) {
    const progress = this.calculateUserProgress(tasks);
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    const activeTasks = tasks.filter(task => task.status !== "completed").length;

    return {
      progress,
      completedTasks,
      activeTasks,
      totalTasks: tasks.length,
      attendanceDays: user.attendanceCount,
      isEligibleForCertificate: this.isEligibleForCertificate(user, tasks)
    };
  }
}