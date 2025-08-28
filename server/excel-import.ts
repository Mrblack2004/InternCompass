import { storage } from "./storage";

// Sample data that would normally come from Excel sheet
const excelInternData = [
  {
    username: "intern",
    password: "intern123",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    mobileNumber: "+1234567890",
    department: "Software Development",
    profilePhoto: null,
    startDate: "2024-06-01",
    endDate: "2024-08-30",
  },
  {
    username: "john_doe",
    password: "john123",
    name: "John Doe",
    email: "john.doe@email.com",
    mobileNumber: "+1987654321",
    department: "Marketing",
    profilePhoto: null,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
  },
  {
    username: "alice_smith",
    password: "alice123",
    name: "Alice Smith",
    email: "alice.smith@email.com",
    mobileNumber: "+1122334455",
    department: "Human Resources",
    profilePhoto: null,
    startDate: "2024-05-15",
    endDate: "2024-08-15",
  }
];

export async function importExcelData() {
  console.log("Importing Excel data...");
  
  for (const internData of excelInternData) {
    try {
      // Check if intern already exists
      const existingIntern = await storage.getInternByUsername(internData.username);
      if (!existingIntern) {
        await storage.createIntern({
          ...internData,
          progress: 0,
          isActive: true,
          attendanceCount: 0,
        });
        console.log(`Imported intern: ${internData.name}`);
      }
    } catch (error) {
      console.error(`Failed to import intern ${internData.name}:`, error);
    }
  }
  
  console.log("Excel data import completed.");
}