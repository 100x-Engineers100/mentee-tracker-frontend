
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { AttendanceRecord } from '@/services/googleSheetsService';

const PreviewImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handlePreview = () => {
    setIsLoading(true);
    // Mock file reading and preview generation
    setTimeout(() => {
      // Generate sample preview data
      const mockPreviewData: AttendanceRecord[] = [
        {
          id: 'preview-1',
          name: 'John Preview',
          email: 'john.preview@example.com',
          phone: '123-456-7890',
          attendanceStatus: [false, false, false, false],
          missedClasses: 4,
          priority: 'P0',
          lastAttendance: '2025-05-01',
          status: 'Support Needed'
        },
        {
          id: 'preview-2',
          name: 'Jane Preview',
          email: 'jane.preview@example.com',
          phone: '234-567-8901',
          attendanceStatus: [false, false, true, true],
          missedClasses: 2,
          priority: 'P2',
          lastAttendance: '2025-05-08',
          status: 'In Progress'
        },
        {
          id: 'preview-3',
          name: 'Bob Preview',
          email: 'bob.preview@example.com',
          phone: '345-678-9012',
          attendanceStatus: [true, true, true, true],
          missedClasses: 0,
          priority: null,
          lastAttendance: '2025-05-15',
          status: 'Completed'
        }
      ];
      
      setPreviewData(mockPreviewData);
      setStep('preview');
      setIsLoading(false);
    }, 1500);
  };

  const handleImport = () => {
    setIsLoading(true);
    // Mock import process
    setTimeout(() => {
      toast({
        title: "Import successful",
        description: `${previewData.length} mentees have been imported and categorized.`,
      });
      setIsLoading(false);
      setStep('upload');
      setFile(null);
      setPreviewData([]);
    }, 2000);
  };

  const handleCancel = () => {
    setStep('upload');
    setFile(null);
    setPreviewData([]);
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200';
      case 'P1': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Attendance Data</CardTitle>
        <CardDescription>
          Upload a spreadsheet to preview and import mentee attendance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Upload size={48} className="text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Upload Attendance Spreadsheet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a CSV or Excel file with mentee attendance data
            </p>
            <div className="flex w-full max-w-md">
              <Input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {file && (
              <div className="flex items-center mt-4 text-sm text-muted-foreground">
                <FileCheck size={16} className="mr-1" />
                <span>{file.name} selected</span>
              </div>
            )}
          </div>
        )}

        {step === 'preview' && (
          <>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-center text-amber-800">
              <AlertCircle size={16} className="mr-2" />
              <span className="text-sm">Preview mode - Review the data before importing</span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Missed Classes</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((mentee) => (
                    <TableRow key={mentee.id}>
                      <TableCell className="font-medium">{mentee.name}</TableCell>
                      <TableCell>{mentee.email}</TableCell>
                      <TableCell>{mentee.missedClasses}</TableCell>
                      <TableCell>
                        {mentee.priority ? (
                          <Badge className={`${getPriorityColor(mentee.priority)}`}>
                            {mentee.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge>{mentee.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step === 'upload' ? (
          <div className="flex gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={handlePreview} disabled={!file || isLoading}>
              {isLoading ? 'Processing...' : 'Preview Import'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Importing...' : 'Confirm Import'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PreviewImport;
