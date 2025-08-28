import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInternSchema, insertTaskSchema, insertMeetingSchema, insertCertificateSchema, insertNotificationSchema } from "@shared/schema";
import { ProgressCalculator } from "./progress-calculator";
import { importExcelData } from "./excel-import";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Import Excel data on startup
  await importExcelData();

  // Authentication routes
  app.post("/api/interns/authenticate", async (req, res) => {
    try {
      const { username, password } = req.body;
      const intern = await storage.authenticateIntern(username, password);
      if (!intern) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(intern);
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Attendance routes
  app.post("/api/interns/:id/attendance", async (req, res) => {
    try {
      const intern = await storage.getIntern(req.params.id);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }
      
      const updatedIntern = await storage.updateIntern(req.params.id, {
        attendanceCount: intern.attendanceCount + 1
      });
      
      // Recalculate progress after attendance update
      await ProgressCalculator.calculateInternProgress(req.params.id);
      
      res.json(updatedIntern);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Intern routes
  app.get("/api/interns", async (req, res) => {
    try {
      const interns = await storage.getAllInterns();
      res.json(interns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interns" });
    }
  });

  app.get("/api/interns/:id", async (req, res) => {
    try {
      const intern = await storage.getIntern(req.params.id);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }
      res.json(intern);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch intern" });
    }
  });

  app.post("/api/interns", async (req, res) => {
    try {
      const validatedData = insertInternSchema.parse(req.body);
      const intern = await storage.createIntern(validatedData);
      res.status(201).json(intern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create intern" });
    }
  });

  app.patch("/api/interns/:id", async (req, res) => {
    try {
      const partialData = insertInternSchema.partial().parse(req.body);
      const intern = await storage.updateIntern(req.params.id, partialData);
      if (!intern) {
        return res.status(404).json({ message: "Intern not found" });
      }
      res.json(intern);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update intern" });
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

  app.get("/api/tasks/intern/:internId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByIntern(req.params.internId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      
      // Create notification for assigned intern
      if (validatedData.assignedTo) {
        await storage.createNotification({
          internId: validatedData.assignedTo,
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
      
      // Recalculate progress and check certificate eligibility when task is completed
      if (task.assignedTo && partialData.status === "completed") {
        await ProgressCalculator.calculateInternProgress(task.assignedTo);
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

  // Meeting routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/meetings/intern/:internId", async (req, res) => {
    try {
      const meetings = await storage.getMeetingsByIntern(req.params.internId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const validatedData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(validatedData);
      
      // Create notifications for attendees
      if (validatedData.attendees) {
        for (const internId of validatedData.attendees) {
          await storage.createNotification({
            internId,
            type: "meeting_scheduled",
            title: "New Meeting Scheduled",
            message: `You have been invited to: ${validatedData.title} on ${validatedData.date}`,
            isRead: false,
          });
        }
      }
      
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
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

  app.get("/api/certificates/intern/:internId", async (req, res) => {
    try {
      const certificate = await storage.getCertificateByIntern(req.params.internId);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  app.post("/api/certificates", async (req, res) => {
    try {
      const validatedData = insertCertificateSchema.parse(req.body);
      const certificate = await storage.createCertificate(validatedData);
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  app.patch("/api/certificates/:id", async (req, res) => {
    try {
      const partialData = insertCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateCertificate(req.params.id, partialData);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Create notification when certificate is generated
      if (partialData.isGenerated && partialData.certificateUrl) {
        await storage.createNotification({
          internId: certificate.internId,
          type: "certificate_ready",
          title: "Certificate Available",
          message: "Your internship certificate is ready for download!",
          isRead: false,
        });
      }
      
      res.json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update certificate" });
    }
  });

  // Notification routes
  app.get("/api/notifications/intern/:internId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByIntern(req.params.internId);
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

  // Stats endpoint for admin dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const interns = await storage.getAllInterns();
      const tasks = await storage.getAllTasks();
      const meetings = await storage.getAllMeetings();
      const certificates = await storage.getAllCertificates();

      const stats = {
        totalInterns: interns.length,
        activeTasks: tasks.filter(t => t.status !== 'completed').length,
        totalMeetings: meetings.length,
        certificatesIssued: certificates.filter(c => c.isGenerated).length,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
