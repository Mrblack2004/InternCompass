import { storage } from "./storage";
import { ProgressCalculator } from "./progress-calculator";

export class DailyTimer {
  private static instance: DailyTimer;
  private timer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): DailyTimer {
    if (!DailyTimer.instance) {
      DailyTimer.instance = new DailyTimer();
    }
    return DailyTimer.instance;
  }

  public start() {
    console.log("Starting daily timer for internship management...");
    
    // Run immediately on startup
    this.runDailyTasks();
    
    // Then run every 24 hours
    this.timer = setInterval(() => {
      this.runDailyTasks();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("Daily timer stopped");
    }
  }

  private async runDailyTasks() {
    try {
      console.log("Running daily internship management tasks...");
      
      // Get all interns
      const interns = await storage.getUsersByRole("intern");
      
      for (const intern of interns) {
        try {
          // Recalculate progress for each intern
          await ProgressCalculator.calculateUserProgress(intern.id);
          issuedDate: new Date().toISOString(),
          certificateUrl: null,
          isGenerated: false,
        }
        
        console.log("✓ Sample data initialization completed");
      }
      
      console.log("Daily tasks completed successfully");
    } catch (error) {
      console.error("Error running daily tasks:", error);
    }
  }
}