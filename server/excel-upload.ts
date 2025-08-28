import { storage } from "./storage";

export interface ExcelInternData {
  username: string;
  password: string;
  name: string;
  email: string;
  mobileNumber: string;
  department: string;
  startDate: string;
  endDate: string;
}

export interface ExcelAdminData {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

export async function processInternExcel(data: ExcelInternData[]): Promise<void> {
  console.log(`Processing ${data.length} intern records from Excel...`);
  
  for (const internData of data) {
    try {
      // Validate required fields
      if (!internData.username || !internData.password || !internData.name || !internData.email) {
        console.warn(`Skipping intern record - missing required fields:`, internData);
        continue;
      }

      // Check if intern already exists
      const existingIntern = await storage.getInternByUsername(internData.username);
      if (!existingIntern) {
        await storage.createIntern({
          username: internData.username,
          password: internData.password,
          name: internData.name,
          email: internData.email,
          mobileNumber: internData.mobileNumber || "",
          department: internData.department || "General",
          profilePhoto: null,
          startDate: internData.startDate || "2024-01-01",
          endDate: internData.endDate || "2024-12-31",
          progress: 0,
          isActive: true,
          attendanceCount: 0,
        });
        console.log(`✓ Imported intern: ${internData.name} (${internData.username})`);
      } else {
        console.log(`- Intern already exists: ${internData.username}`);
      }
    } catch (error) {
      console.error(`Failed to import intern ${internData.name}:`, error);
    }
  }
  
  console.log("Excel intern data import completed.");
}

export async function processAdminExcel(data: ExcelAdminData[]): Promise<void> {
  console.log(`Processing ${data.length} admin records from Excel...`);
  
  for (const adminData of data) {
    try {
      // Validate required fields
      if (!adminData.username || !adminData.password || !adminData.name) {
        console.warn(`Skipping admin record - missing required fields:`, adminData);
        continue;
      }

      // For now, we'll just log admin data since we don't have admin table
      // In a real implementation, you'd create an admin table
      console.log(`✓ Admin record: ${adminData.name} (${adminData.username}) - ${adminData.role || 'Admin'}`);
    } catch (error) {
      console.error(`Failed to process admin ${adminData.name}:`, error);
    }
  }
  
  console.log("Excel admin data processing completed.");
}