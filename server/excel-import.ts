import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

// This function will be replaced with actual Excel file reading
export async function importExcelData() {
  console.log("Checking for Excel files...");
  
  const excelFolder = path.join(process.cwd(), 'excel-templates');
  const internsFile = path.join(excelFolder, 'interns.json'); // Temporary JSON format
  
  try {
    // Check if Excel data files exist
    if (fs.existsSync(internsFile)) {
      const fileData = fs.readFileSync(internsFile, 'utf8');
      const excelInternData = JSON.parse(fileData);
      
      console.log(`Found Excel data file with ${excelInternData.length} intern records`);
      
      for (const internData of excelInternData) {
        try {
          // Validate required fields
          if (!internData.username || !internData.password || !internData.name || !internData.email) {
            console.warn(`Skipping intern record - missing required fields:`, internData);
            continue;
          }

          // Check if intern already exists
          const existingIntern = await storage.getUserByUsername(internData.username);
          if (!existingIntern) {
            await storage.createUser({
              username: internData.username,
              password: internData.password,
              role: "intern",
              name: internData.name,
              email: internData.email,
              mobileNumber: internData.mobileNumber || "",
              department: internData.department || "General",
              teamId: null,
              profilePhoto: null,
              startDate: internData.startDate || "2024-01-01",
              endDate: internData.endDate || "2024-12-31",
              progress: 0,
              isActive: true,
              attendanceCount: 0,
            });
            console.log(`✓ Imported intern from Excel: ${internData.name} (${internData.username})`);
          } else {
            console.log(`- Intern already exists: ${internData.username}`);
          }
        } catch (error) {
          console.error(`Failed to import intern ${internData.name}:`, error);
        }
      }
    } else {
      console.log("No Excel data file found. Using sample data for demonstration.");
      
      // Sample data for demonstration only - remove this when you have real Excel data
      const sampleData = [
        {
          username: "demo_intern",
          password: "demo123",
          name: "Demo Intern",
          email: "demo@company.com",
          mobileNumber: "+1234567890",
          department: "Demo Department",
          startDate: "2024-06-01",
          endDate: "2024-08-30",
        }
      ];
      
      for (const internData of sampleData) {
        const existingIntern = await storage.getUserByUsername(internData.username);
        if (!existingIntern) {
          await storage.createUser({
            ...internData,
            role: "intern",
            teamId: null,
            profilePhoto: null,
            progress: 0,
            isActive: true,
            attendanceCount: 0,
          });
          console.log(`✓ Created demo intern: ${internData.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error reading Excel data:", error);
    console.log("Please check the Excel file format and try again.");
  }
  
  console.log("Excel data import process completed.");
}