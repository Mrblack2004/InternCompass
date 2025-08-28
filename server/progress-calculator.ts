import { storage } from "./storage";

export class ProgressCalculator {
  static async calculateInternProgress(internId: string): Promise<number> {
    try {
      const tasks = await storage.getTasksByIntern(internId);
      const intern = await storage.getIntern(internId);
      
      if (!intern || tasks.length === 0) return 0;
      
      // Calculate task completion progress (70% weight)
      const completedTasks = tasks.filter(task => task.status === "completed").length;
      const taskProgress = (completedTasks / tasks.length) * 70;
      
      // Calculate attendance progress (30% weight)
      const internshipDuration = this.calculateInternshipDays(intern.startDate, intern.endDate);
      const attendanceProgress = Math.min((intern.attendanceCount / internshipDuration) * 30, 30);
      
      const totalProgress = Math.round(taskProgress + attendanceProgress);
      
      // Update progress in database
      await storage.updateIntern(internId, { progress: totalProgress });
      
      return totalProgress;
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  }
  
  static calculateInternshipDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  static async checkCertificateEligibility(internId: string): Promise<boolean> {
    try {
      const intern = await storage.getIntern(internId);
      if (!intern) return false;
      
      const today = new Date();
      const endDate = new Date(intern.endDate);
      
      // Check if internship has ended and progress is >= 80%
      return today >= endDate && intern.progress >= 80;
    } catch (error) {
      console.error("Error checking certificate eligibility:", error);
      return false;
    }
  }
  
  static async generateCertificateIfEligible(internId: string): Promise<void> {
    try {
      const isEligible = await this.checkCertificateEligibility(internId);
      if (!isEligible) return;
      
      const certificate = await storage.getCertificateByIntern(internId);
      if (certificate && !certificate.isGenerated) {
        const today = new Date().toISOString().split('T')[0];
        const certificateUrl = `/certificates/${internId}_certificate.pdf`;
        
        await storage.updateCertificate(certificate.id, {
          isGenerated: true,
          issuedDate: today,
          certificateUrl: certificateUrl
        });
        
        // Create notification
        await storage.createNotification({
          internId: internId,
          type: "certificate",
          title: "Certificate Generated",
          message: "Your internship certificate has been automatically generated and is ready for download!",
          isRead: false
        });
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  }
}