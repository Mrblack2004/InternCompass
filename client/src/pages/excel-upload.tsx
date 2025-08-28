import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Users, UserCheck } from "lucide-react";

export default function ExcelUpload() {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: "intern" | "admin") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Upload Successful",
          description: `${result.count} ${type} records imported successfully`,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${type} Excel file`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel Data Import</h1>
          <p className="text-gray-600">Upload your Excel files to import intern and admin data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intern Upload */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Upload Intern Data</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Upload your intern.xlsx file from:<br />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  D:\InternCompass\InternCompass\client\src\excel\intern.xlsx
                </code>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Required columns: username, password, name, email, mobileNumber, department, startDate, endDate
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "intern");
                    }}
                    className="hidden"
                    id="intern-upload"
                  />
                  <label htmlFor="intern-upload">
                    <Button asChild disabled={uploading} data-testid="button-upload-intern">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Select Intern Excel File"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Upload */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>Upload Admin Data</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Upload your admin.xlsx file from:<br />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  D:\InternCompass\InternCompass\client\src\excel\admin.xlsx
                </code>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Required columns: username, password, name, email, role
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "admin");
                    }}
                    className="hidden"
                    id="admin-upload"
                  />
                  <label htmlFor="admin-upload">
                    <Button asChild disabled={uploading} data-testid="button-upload-admin">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Select Admin Excel File"}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Navigate to your local files at the paths shown above</li>
              <li>Click the upload buttons to select your Excel files</li>
              <li>The system will validate and import your data</li>
              <li>You can then login with the credentials from your Excel files</li>
              <li>The application will restart automatically after import</li>
            </ol>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Excel Format Requirements:</h4>
              <p className="text-sm text-yellow-700">
                Make sure your Excel files have the exact column headers mentioned above. 
                The system will skip any rows with missing required data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}