import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTaskSchema, insertResourceSchema, insertCertificateSchema, insertNotificationSchema } from "@shared/schema";
import { ProgressCalculator } from "./progress-calculator";
import { importExcelData } from "./excel-import";
import multer from "multer";
import * as XLSX from "xlsx";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Import Excel data on startup
  await importExcelData();

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        console.log("Authentication failed for username:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log("Authentication successful for user:", user.name);
      res.json(user);
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/users/team/:teamId", async (req, res) => {
    try {
      const users = await storage.getUsersByTeam(req.params.teamId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/admin/:adminId", async (req, res) => {
    try {
      const team = await storage.getTeamByAdmin(req.params.adminId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/user/:userId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.params.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/team/:teamId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByTeam(req.params.teamId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team tasks" });
    }
  });

  app.get("/api/tasks/admin/:adminId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByAdmin(req.params.adminId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      
      // Create notifications for assigned users
      if (validatedData.isTeamTask && validatedData.teamId) {
        const teamMembers = await storage.getUsersByTeam(validatedData.teamId);
        for (const member of teamMembers.filter(m => m.role === "intern")) {
          await storage.createNotification({
            userId: member.id,
            type: "task_assigned",
            title: "New Team Task Assigned",
            message: `A new team task has been assigned: ${validatedData.title}`,
            isRead: false,
          });
        }
      } else if (validatedData.assignedTo) {
        await storage.createNotification({
          userId: validatedData.assignedTo,
          type: "task_assigned",
          title: "New Task Assigned",
          message: `You have been assigned a new task: ${validatedData.title}`,
          isRead: false,
        });
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const partialData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, partialData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Recalculate progress when task is completed
      if (task.assignedTo && partialData.status === "completed") {
        await ProgressCalculator.calculateUserProgress(task.assignedTo);
        await ProgressCalculator.generateCertificateIfEligible(task.assignedTo);
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/team/:teamId", async (req, res) => {
    try {
      const resources = await storage.getResourcesByTeam(req.params.teamId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team resources" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validatedData);
      
      // Create notifications for team members
      if (validatedData.teamId) {
        const teamMembers = await storage.getUsersByTeam(validatedData.teamId);
        for (const member of teamMembers.filter(m => m.role === "intern")) {
          await storage.createNotification({
            userId: member.id,
            type: "resource_uploaded",
            title: "New Resource Available",
            message: `A new ${validatedData.type.replace('_', ' ')} has been shared: ${validatedData.title}`,
            isRead: false,
          });
        }
      }
      
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Certificate routes
  app.get("/api/certificates", async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.get("/api/certificates/user/:userId", async (req, res) => {
    try {
      const certificate = await storage.getCertificateByUser(req.params.userId);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Notification routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const partialData = insertNotificationSchema.partial().parse(req.body);
      const notification = await storage.updateNotification(req.params.id, partialData);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Stats endpoint for dashboards
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const tasks = await storage.getAllTasks();
      const resources = await storage.getAllResources();
      const certificates = await storage.getAllCertificates();

      const stats = {
        totalInterns: users.filter(u => u.role === "intern").length,
        totalAdmins: users.filter(u => u.role === "admin").length,
        activeTasks: tasks.filter(t => t.status !== 'completed').length,
        totalResources: resources.length,
        certificatesIssued: certificates.filter(c => c.isGenerated).length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Mark attendance endpoint
  app.post("/api/users/:id/attendance", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUser(req.params.id, {
        attendanceCount: user.attendanceCount + 1
      });

      // Recalculate progress
      const { ProgressCalculator } = await import("./progress-calculator");
      await ProgressCalculator.calculateUserProgress(req.params.id);

      res.json({ message: "Attendance marked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  // Super Admin specific routes
  app.get("/api/superadmin/overview", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      const teamData = [];

      for (const team of teams) {
        const admin = await storage.getUser(team.adminId);
        const members = await storage.getUsersByTeam(team.id);
        const teamTasks = await storage.getTasksByTeam(team.id);
        
        teamData.push({
          team,
          admin,
          members: members.filter(m => m.role === "intern"),
          taskCount: teamTasks.length,
          completedTasks: teamTasks.filter(t => t.status === "completed").length,
        });
      }

      res.json(teamData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch super admin overview" });
    }
  });

  // Legacy routes for backward compatibility
  app.post("/api/interns/authenticate", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.authenticateUser(username, password);
      if (!user || user.role !== "intern") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/interns", async (req, res) => {
    try {
      const interns = await storage.getUsersByRole("intern");
      res.json(interns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interns" });
    }
  });

  app.get("/api/tasks/intern/:internId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.params.internId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/meetings/intern/:internId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.internId);
      if (!user?.teamId) {
        return res.json([]);
      }
      const meetings = await storage.getResourcesByTeam(user.teamId);
      res.json(meetings.filter(r => r.type === "meeting_link"));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/certificates/intern/:internId", async (req, res) => {
    try {
      const certificate = await storage.getCertificateByUser(req.params.internId);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  app.get("/api/notifications/intern/:internId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.internId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}