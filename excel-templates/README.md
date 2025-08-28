# Excel Sheet Upload Instructions

## Step-by-Step Process

### 1. File Location
Place your Excel files in this folder: `excel-templates/`

### 2. Required Excel Files
You need to create 2 Excel files:

#### File 1: `interns.xlsx` (or `interns.csv`)
**Required Column Headers (in exact order):**
```
username | password | name | email | mobileNumber | department | startDate | endDate
```

**Example Data:**
```
john_doe    | john123    | John Doe      | john@email.com     | +1234567890 | Engineering    | 2024-06-01 | 2024-08-30
alice_smith | alice123   | Alice Smith   | alice@email.com    | +1987654321 | Marketing      | 2024-07-01 | 2024-09-30
bob_wilson  | bob123     | Bob Wilson    | bob@email.com      | +1122334455 | HR             | 2024-05-15 | 2024-08-15
```

#### File 2: `admins.xlsx` (or `admins.csv`)
**Required Column Headers (in exact order):**
```
username | password | name | email | role
```

**Example Data:**
```
admin       | admin123   | System Admin     | admin@company.com      | Administrator
hr_manager  | hr123      | HR Manager       | hr@company.com         | HR Manager
it_admin    | it123      | IT Administrator | it@company.com         | IT Admin
```

### 3. Upload Process

#### Option A: Direct File Placement
1. Save your Excel files in the `excel-templates/` folder
2. Name them exactly: `interns.xlsx` and `admins.xlsx`
3. Restart the application
4. The system will automatically import the data

#### Option B: API Upload (Coming Soon)
- Web interface for file upload
- Drag and drop functionality
- Real-time validation

### 4. Data Validation Rules

#### For Interns:
- `username`: Must be unique, no spaces, alphanumeric only
- `password`: Minimum 6 characters
- `name`: Full name as it should appear
- `email`: Valid email format
- `mobileNumber`: Include country code (e.g., +1234567890)
- `department`: Department name
- `startDate`: Format: YYYY-MM-DD
- `endDate`: Format: YYYY-MM-DD (must be after start date)

#### For Admins:
- `username`: Must be unique, no spaces
- `password`: Minimum 8 characters recommended
- `name`: Full name
- `email`: Valid email format
- `role`: Job title/role description

### 5. Current Status
The system currently reads from hardcoded sample data. To use your Excel data:

1. Place files in `excel-templates/` folder
2. Update the import function to read from your files
3. Restart the application

### 6. Troubleshooting
- Ensure column headers match exactly (case-sensitive)
- Check for empty rows in Excel
- Verify date formats are YYYY-MM-DD
- Make sure usernames are unique
- Check that file extensions are .xlsx or .csv