import { 
  type Intern, 
  type InsertIntern, 
  type Task, 
  type InsertTask,
  type Meeting,
  type InsertMeeting,
  type Certificate,
  type InsertCertificate,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { interns, tasks, meetings, certificates, notifications } from "../shared/schema";

export interface IStorage {
  // Interns
  getIntern(id: string): Promise<Intern | undefined>;
  getInternByEmail(email: string): Promise<Intern | undefined>;
  getInternByUsername(username: string): Promise<Intern | undefined>;
  authenticateIntern(username: string, password: string): Promise<Intern | undefined>;
  getAllInterns(): Promise<Intern[]>;
  createIntern(intern: InsertIntern): Promise<Intern>;
  updateIntern(id: string, updates: Partial<InsertIntern>): Promise<Intern | undefined>;
  
  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByIntern(internId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Meetings
  getMeeting(id: string): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
  getMeetingsByIntern(internId: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  
  // Certificates
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificateByIntern(internId: string): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  
  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByIntern(internId: string): Promise<Notification[]>;
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if sample intern already exists
      const existingIntern = await this.getInternByUsername("intern");
      if (!existingIntern) {
        // Create sample intern
        const sampleIntern = await this.createIntern({
          username: "intern",
          password: "intern123",
          name: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          mobileNumber: "+1234567890",
          department: "Software Development",
          profilePhoto: null,
          startDate: "2024-06-01",
          endDate: "2024-08-30",
          progress: 65,
          isActive: true,
          attendanceCount: 45,
        });

        // Create sample tasks
        await this.createTask({
          title: "Build User Authentication System",
          description: "Implement user login and registration functionality using JWT tokens and secure password hashing.",
          priority: "high",
          status: "todo",
          dueDate: "2024-07-15",
          assignedTo: sampleIntern.id,
        });

        await this.createTask({
          title: "Design Database Schema",
          description: "Create comprehensive database design for the application including user management and data relationships.",
          priority: "medium",
          status: "progress",
          dueDate: "2024-07-10",
          assignedTo: sampleIntern.id,
        });

        await this.createTask({
          title: "Setup Development Environment",
          description: "Install and configure all necessary development tools, IDEs, and project dependencies.",
          priority: "high",
          status: "completed",
          dueDate: "2024-06-08",
          assignedTo: sampleIntern.id,
        });

        // Create sample meetings
        await this.createMeeting({
          title: "Weekly Progress Review",
          description: "Discuss current project status, challenges, and upcoming milestones with the team lead.",
          date: "2024-07-08",
          time: "14:00",
          duration: "1 hour",
          platform: "Google Meet",
          meetingLink: "https://meet.google.com/abc-defg-hij",
          attendees: [sampleIntern.id],
        });

        await this.createMeeting({
          title: "Project Kickoff Meeting",
          description: "Introduction to the new project requirements and team collaboration guidelines.",
          date: "2024-07-12",
          time: "10:00",
          duration: "1.5 hours",
          platform: "Google Meet",
          meetingLink: "https://meet.google.com/xyz-uvw-rst",
          attendees: [sampleIntern.id],
        });

        // Create sample certificate
        await this.createCertificate({
          internId: sampleIntern.id,
          issuedDate: null,
          certificateUrl: null,
          isGenerated: false,
        });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // Intern methods
  async getIntern(id: string): Promise<Intern | undefined> {
    const [intern] = await db.select().from(interns).where(eq(interns.id, id));
    return intern || undefined;
  }

  async getInternByEmail(email: string): Promise<Intern | undefined> {
    const [intern] = await db.select().from(interns).where(eq(interns.email, email));
    return intern || undefined;
  }

  async getInternByUsername(username: string): Promise<Intern | undefined> {
    const [intern] = await db.select().from(interns).where(eq(interns.username, username));
    return intern || undefined;
  }

  async authenticateIntern(username: string, password: string): Promise<Intern | undefined> {
    const [intern] = await db.select().from(interns).where(
      and(eq(interns.username, username), eq(interns.password, password))
    );
    return intern || undefined;
  }

  async getAllInterns(): Promise<Intern[]> {
    return await db.select().from(interns);
  }

  async createIntern(insertIntern: InsertIntern): Promise<Intern> {
    const [intern] = await db.insert(interns).values(insertIntern).returning();
    return intern;
  }

  async updateIntern(id: string, updates: Partial<InsertIntern>): Promise<Intern | undefined> {
    const [intern] = await db.update(interns).set(updates).where(eq(interns.id, id)).returning();
    return intern || undefined;
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByIntern(internId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, internId));
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task || undefined;
  }

  // Meeting methods
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, id));
    return meeting || undefined;
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings);
  }

  async getMeetingsByIntern(internId: string): Promise<Meeting[]> {
    const allMeetings = await db.select().from(meetings);
    return allMeetings.filter(meeting => 
      meeting.attendees?.includes(internId)
    );
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(insertMeeting).returning();
    return meeting;
  }

  async updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const [meeting] = await db.update(meetings).set(updates).where(eq(meetings.id, id)).returning();
    return meeting || undefined;
  }

  // Certificate methods
  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async getCertificateByIntern(internId: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.internId, internId));
    return certificate || undefined;
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const [certificate] = await db.insert(certificates).values(insertCertificate).returning();
    return certificate;
  }

  async updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const [certificate] = await db.update(certificates).set(updates).where(eq(certificates.id, id)).returning();
    return certificate || undefined;
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByIntern(internId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.internId, internId));
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification | undefined> {
    const [notification] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return notification || undefined;
  }
}

export const storage = new DatabaseStorage();