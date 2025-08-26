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
import { randomUUID } from "crypto";

export interface IStorage {
  // Interns
  getIntern(id: string): Promise<Intern | undefined>;
  getInternByEmail(email: string): Promise<Intern | undefined>;
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

export class MemStorage implements IStorage {
  private interns: Map<string, Intern>;
  private tasks: Map<string, Task>;
  private meetings: Map<string, Meeting>;
  private certificates: Map<string, Certificate>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.interns = new Map();
    this.tasks = new Map();
    this.meetings = new Map();
    this.certificates = new Map();
    this.notifications = new Map();
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create sample intern
    const sampleIntern: Intern = {
      id: "intern-1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      department: "Software Development",
      startDate: "2024-06-01",
      endDate: "2024-08-30",
      progress: 65,
      isActive: true,
      offerLetterUrl: "/documents/offer-letter.pdf",
      createdAt: new Date(),
    };
    this.interns.set(sampleIntern.id, sampleIntern);

    // Create sample tasks
    const sampleTasks: Task[] = [
      {
        id: "task-1",
        title: "Build User Authentication System",
        description: "Implement user login and registration functionality using JWT tokens and secure password hashing.",
        priority: "high",
        status: "todo",
        dueDate: "2024-07-15",
        assignedTo: "intern-1",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "task-2",
        title: "Design Database Schema",
        description: "Create comprehensive database design for the application including user management and data relationships.",
        priority: "medium",
        status: "progress",
        dueDate: "2024-07-10",
        assignedTo: "intern-1",
        createdAt: new Date(),
        completedAt: null,
      },
      {
        id: "task-3",
        title: "Setup Development Environment",
        description: "Install and configure all necessary development tools, IDEs, and project dependencies.",
        priority: "high",
        status: "completed",
        dueDate: "2024-06-08",
        assignedTo: "intern-1",
        createdAt: new Date(),
        completedAt: new Date(),
      },
    ];
    sampleTasks.forEach(task => this.tasks.set(task.id, task));

    // Create sample meetings
    const sampleMeetings: Meeting[] = [
      {
        id: "meeting-1",
        title: "Weekly Progress Review",
        description: "Discuss current project status, challenges, and upcoming milestones with the team lead.",
        date: "2024-07-08",
        time: "14:00",
        duration: "1 hour",
        platform: "Google Meet",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        attendees: ["intern-1"],
        createdAt: new Date(),
      },
      {
        id: "meeting-2",
        title: "Project Kickoff Meeting",
        description: "Introduction to the new project requirements and team collaboration guidelines.",
        date: "2024-07-12",
        time: "10:00",
        duration: "1.5 hours",
        platform: "Google Meet",
        meetingLink: "https://meet.google.com/xyz-uvw-rst",
        attendees: ["intern-1"],
        createdAt: new Date(),
      },
    ];
    sampleMeetings.forEach(meeting => this.meetings.set(meeting.id, meeting));

    // Create sample certificate
    const sampleCertificate: Certificate = {
      id: "cert-1",
      internId: "intern-1",
      issuedDate: null,
      certificateUrl: null,
      isGenerated: false,
      createdAt: new Date(),
    };
    this.certificates.set(sampleCertificate.id, sampleCertificate);
  }

  // Intern methods
  async getIntern(id: string): Promise<Intern | undefined> {
    return this.interns.get(id);
  }

  async getInternByEmail(email: string): Promise<Intern | undefined> {
    return Array.from(this.interns.values()).find(intern => intern.email === email);
  }

  async getAllInterns(): Promise<Intern[]> {
    return Array.from(this.interns.values());
  }

  async createIntern(insertIntern: InsertIntern): Promise<Intern> {
    const id = randomUUID();
    const intern: Intern = { 
      ...insertIntern, 
      id, 
      createdAt: new Date(),
    };
    this.interns.set(id, intern);
    return intern;
  }

  async updateIntern(id: string, updates: Partial<InsertIntern>): Promise<Intern | undefined> {
    const intern = this.interns.get(id);
    if (!intern) return undefined;
    
    const updatedIntern = { ...intern, ...updates };
    this.interns.set(id, updatedIntern);
    return updatedIntern;
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByIntern(internId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.assignedTo === internId);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      ...updates,
      completedAt: updates.status === 'completed' ? new Date() : task.completedAt,
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Meeting methods
  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values());
  }

  async getMeetingsByIntern(internId: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(meeting => 
      meeting.attendees?.includes(internId)
    );
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const meeting: Meeting = { 
      ...insertMeeting, 
      id, 
      createdAt: new Date(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...updates };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  // Certificate methods
  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByIntern(internId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(cert => cert.internId === internId);
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return Array.from(this.certificates.values());
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = { 
      ...insertCertificate, 
      id, 
      createdAt: new Date(),
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate | undefined> {
    const certificate = this.certificates.get(id);
    if (!certificate) return undefined;
    
    const updatedCertificate = { ...certificate, ...updates };
    this.certificates.set(id, updatedCertificate);
    return updatedCertificate;
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByIntern(internId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notif => notif.internId === internId);
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotification(id: string, updates: Partial<InsertNotification>): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, ...updates };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
