import { 
  type User, 
  type InsertUser, 
  type Task, 
  type InsertTask,
  type Resource,
  type InsertResource,
  type Certificate,
  type InsertCertificate,
  type Notification,
  type InsertNotification,
  type Team,
  type InsertTeam
} from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import { db } from "./db";
import { users, tasks, resources, certificates, notifications, teams } from "../shared/schema";

export interface IStorage {
  // Authentication
  authenticateUser(username: string, password: string): Promise<User | undefined>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByTeam(teamId: string): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Teams
  getTeam(id: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  getTeamByAdmin(adminId: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team | undefined>;
  
  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByTeam(teamId: string): Promise<Task[]>;
  getTasksByAdmin(adminId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Resources
  getResource(id: string): Promise<Resource | undefined>;
  getResourcesByTeam(teamId: string): Promise<Resource[]>;
  getResourcesByAdmin(adminId: string): Promise<Resource[]>;
  getAllResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource | undefined>;
  
  // Certificates
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificateByUser(userId: string): Promise<Certificate | undefined>;
  getAllCertificates(): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  updateCertificate(id: string, updates: Partial<InsertCertificate>): Promise<Certificate | undefined>;
  
  // Notifications
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
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
      console.log("Initializing database with sample data...");
      
      // Check if super admin exists
      const superAdmin = await this.getUserByUsername("Watcher");
      if (!superAdmin) {
        console.log("Creating super admin...");
        await this.createUser({
          username: "Watcher",
          password: "12345",
          role: "superadmin",
          name: "Super Admin",
          email: "watcher@company.com",
          teamId: null,
          mobileNumber: null,
          department: null,
          profilePhoto: null,
          startDate: null,
          endDate: null,
          progress: 0,
          isActive: true,
          attendanceCount: 0,
        });
        console.log("✓ Super admin created");
      }

      // Check if sample team exists
      const sampleAdmin = await this.getUserByUsername("admin");
      if (!sampleAdmin) {
        console.log("Creating sample admin and team...");
        // Create sample admin
        const newAdmin = await this.createUser({
          username: "admin",
          password: "admin123",
          role: "admin",
          name: "John Manager",
          email: "admin@company.com",
          teamId: null,
          mobileNumber: "+1234567890",
          department: "Engineering",
          profilePhoto: null,
          startDate: null,
          endDate: null,
          progress: 0,
          isActive: true,
          attendanceCount: 0,
        });
        console.log("✓ Sample admin created");

        // Create sample team
        const sampleTeam = await this.createTeam({
          teamName: "Engineering Team",
          adminId: newAdmin.id,
        });
        console.log("✓ Sample team created");

        // Update admin with team ID
        await this.updateUser(newAdmin.id, { teamId: sampleTeam.id });

        // Create sample intern
        const sampleIntern = await this.createUser({
          username: "intern",
          password: "intern123",
          role: "intern",
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
          teamId: sampleTeam.id,
          mobileNumber: "+1987654321",
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
          status: "pending",
          dueDate: "2024-07-15",
          assignedBy: sampleAdmin.id,
          assignedTo: sampleIntern.id,
          teamId: sampleTeam.id,
          isTeamTask: false,
        });

        await this.createTask({
          title: "Team Meeting Preparation",
          description: "Prepare presentation for weekly team meeting.",
          priority: "medium",
          status: "in-progress",
          dueDate: "2024-07-10",
          assignedBy: sampleAdmin.id,
          assignedTo: null,
          teamId: sampleTeam.id,
          isTeamTask: true,
        });

        // Create sample resources
        await this.createResource({
          title: "Weekly Team Meeting",
          type: "meeting_link",
          link: "https://meet.google.com/abc-defg-hij",
          description: "Weekly progress review meeting",
          uploadedBy: sampleAdmin.id,
          teamId: sampleTeam.id,
        });

        await this.createResource({
          title: "Development Guidelines",
          type: "pdf",
          fileUrl: "/documents/dev-guidelines.pdf",
          description: "Company development standards and best practices",
          uploadedBy: sampleAdmin.id,
          teamId: sampleTeam.id,
        });

        // Create sample certificate
        await this.createCertificate({
          userId: sampleIntern.id,
          issuedDate: null,
          certificateUrl: null,
          isGenerated: false,
        });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  // Authentication
  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.username, username), eq(users.password, password))
    );
    return user || undefined;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByTeam(teamId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.teamId, teamId));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Team methods
  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async getTeamByAdmin(adminId: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.adminId, adminId));
    return team || undefined;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  async updateTeam(id: string, updates: Partial<InsertTeam>): Promise<Team | undefined> {
    const [team] = await db.update(teams).set(updates).where(eq(teams.id, id)).returning();
    return team || undefined;
  }

  // Task methods
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    return await db.select().from(tasks).where(
      or(
        eq(tasks.assignedTo, userId),
        and(eq(tasks.teamId, user.teamId!), eq(tasks.isTeamTask, true))
      )
    );
  }

  async getTasksByTeam(teamId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.teamId, teamId));
  }

  async getTasksByAdmin(adminId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedBy, adminId));
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

  // Resource methods
  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async getResourcesByTeam(teamId: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.teamId, teamId));
  }

  async getResourcesByAdmin(adminId: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.uploadedBy, adminId));
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async updateResource(id: string, updates: Partial<InsertResource>): Promise<Resource | undefined> {
    const [resource] = await db.update(resources).set(updates).where(eq(resources.id, id)).returning();
    return resource || undefined;
  }

  // Certificate methods
  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate || undefined;
  }

  async getCertificateByUser(userId: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.userId, userId));
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

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
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

  // Legacy methods for backward compatibility
  async getIntern(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getInternByUsername(username: string): Promise<User | undefined> {
    return this.getUserByUsername(username);
  }

  async authenticateIntern(username: string, password: string): Promise<User | undefined> {
    return this.authenticateUser(username, password);
  }

  async getAllInterns(): Promise<User[]> {
    return this.getUsersByRole("intern");
  }

  async createIntern(intern: InsertUser): Promise<User> {
    return this.createUser({ ...intern, role: "intern" });
  }

  async updateIntern(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    return this.updateUser(id, updates);
  }

  async getTasksByIntern(internId: string): Promise<Task[]> {
    return this.getTasksByUser(internId);
  }

  async getAllMeetings(): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.type, "meeting_link"));
  }

  async getMeetingsByIntern(internId: string): Promise<Resource[]> {
    const user = await this.getUser(internId);
    if (!user?.teamId) return [];
    return await db.select().from(resources).where(
      and(eq(resources.teamId, user.teamId), eq(resources.type, "meeting_link"))
    );
  }

  async createMeeting(meeting: any): Promise<Resource> {
    return this.createResource({
      title: meeting.title,
      type: "meeting_link",
      link: meeting.meetingLink,
      description: meeting.description,
      uploadedBy: meeting.uploadedBy || "admin-1",
      teamId: meeting.teamId || "team-1",
    });
  }

  async getCertificateByIntern(internId: string): Promise<Certificate | undefined> {
    return this.getCertificateByUser(internId);
  }

  async getNotificationsByIntern(internId: string): Promise<Notification[]> {
    return this.getNotificationsByUser(internId);
  }
}

export const storage = new DatabaseStorage();