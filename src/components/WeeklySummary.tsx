
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import React, { useState, useEffect } from 'react';
import { getWeek, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Download, FileText } from 'lucide-react';

const WeeklySummary: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [format, setFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const cohortStartDate = parseISO('2025-11-06T00:00:00.000Z');
  const cohortStartWeek = getWeek(cohortStartDate);

  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/weekly-attendance-report?batch=6');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWeeklyAttendance(data.reports);
        if (data.reports.length > 0) {
          setSelectedWeek(data.reports[data.reports.length - 1].weekNumber.toString());
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchWeeklyAttendance();
  }, []);

  const handleDownload = () => {
    setIsLoading(true);
    
    setIsLoading(true);
    if (!selectedReport) {
      toast({
        title: "No report selected",
        description: "Please select a week to download the report.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const fileName = `weekly-summary-week-${selectedWeek}.${format}`;

    if (format === 'csv') {
      const csvContent = [
        ["Metric", "Value"],
        ["Total Mentees", selectedReport.totalMentees],
        ["Total Present", selectedReport.totalPresent],
        ["Total Absent", selectedReport.totalAbsent],
        ["Attendance Rate", attendanceRate],
        // Add other relevant fields from selectedReport
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Report generated",
        description: `Weekly summary for Week ${selectedWeek} has been downloaded as CSV.`
      });
      setIsLoading(false);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text("Weekly Summary Report", 14, 16);
      doc.setFontSize(12);
      doc.text(`Week: ${selectedWeek}`, 14, 22);

      autoTable(doc, {
        startY: 30,
        head: [["Metric", "Value"]],
        body: [
          ["Total Mentees", selectedReport.totalMentees],
          ["Total Present", selectedReport.totalPresent],
          ["Total Absent", selectedReport.totalAbsent],
          ["Attendance Rate", attendanceRate],
        ],
        theme: 'grid',
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });

      doc.save(fileName);

      toast({
        title: "Report generated",
        description: `Weekly summary for Week ${selectedWeek} has been downloaded as PDF.`
      });
      setIsLoading(false);
    } else if (format === 'xlsx') {
      const ws_data = [
        ["Metric", "Value"],
        ["Total Mentees", selectedReport.totalMentees],
        ["Total Present", selectedReport.totalPresent],
        ["Total Absent", selectedReport.totalAbsent],
        ["Attendance Rate", attendanceRate],
      ];
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Weekly Summary");
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Report generated",
        description: `Weekly summary for Week ${selectedWeek} has been downloaded as XLSX.`
      });
      setIsLoading(false);
    } else {
      // Placeholder for other formats (XLSX) - would require backend or client-side libraries
      toast({
        title: "Format not supported",
        description: `Downloading ${format.toUpperCase()} reports is not yet supported.`,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const selectedReport = weeklyAttendance.find(report => report.weekNumber.toString() === selectedWeek);

  const totalMentees = selectedReport?.totalMentees || 0;
  const totalPresent = selectedReport?.totalPresent || 0;
  const totalAbsent = selectedReport?.totalAbsent || 0;
  const attendanceRate = totalMentees > 0 ? ((totalPresent / totalMentees) * 100).toFixed(0) + '%' : '0%';

  // Mock data for report preview
  const summaryData = {
    totalMentees: totalMentees,
    attendanceRate: attendanceRate,
    followUpsCompleted: 0, // This data is not available from the backend yet
    highlightStats: [
      `${totalAbsent} mentees were absent this week`,
      `${totalPresent} mentees were present this week`,
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Summary Report</CardTitle>
        <CardDescription>Generate and download attendance and follow-up reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="week-select">Select Week</label>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger id="week-select" className="w-full">
                <SelectValue placeholder="Select a week" />
              </SelectTrigger>
              <SelectContent>
                {weeklyAttendance.map((report) => (
                  <SelectItem key={report.weekNumber} value={report.weekNumber.toString()}>
                    Week {report.weekNumber - cohortStartWeek + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="format-select">File Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format-select" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Preview */}
          <div className="mt-4 p-4 border rounded-md">
            <div className="flex items-center mb-4">
              <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Report Preview</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Mentees:</span>
                <span className="font-medium">{summaryData.totalMentees}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attendance Rate:</span>
                <span className="font-medium">{summaryData.attendanceRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Follow-ups Completed:</span>
                <span className="font-medium">{summaryData.followUpsCompleted}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t">
                <p className="text-xs font-medium mb-1">Highlights:</p>
                <ul className="text-xs space-y-1">
                  {summaryData.highlightStats.map((stat, index) => (
                    <li key={index} className="text-muted-foreground">• {stat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" className="flex items-center gap-2">
          <Calendar size={16} />
          <span>Change Date Range</span>
        </Button>
        <Button onClick={handleDownload} disabled={isLoading} className="flex items-center gap-2">
          <Download size={16} />
          <span>{isLoading ? 'Generating...' : 'Download Report'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeeklySummary;
