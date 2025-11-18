
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { getWeek, parseISO } from 'date-fns';
import { Chart } from '@/components/ui/charts'; // Updated import path to charts 
import { googleSheetsService } from '@/services/googleSheetsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const Analytics: React.FC = () => {
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cohortStartDate = parseISO('2025-11-06T00:00:00.000Z');
  const cohortStartWeek = getWeek(cohortStartDate);

  useEffect(() => {
    const fetchWeeklyAttendance = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/weekly-attendance-report?batch=6`);
        const data = await response.data;   
        setWeeklyAttendance(data.reports);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };


    
    fetchWeeklyAttendance();
  }, []);

  // Data for attendance trend chart
  const chartData = weeklyAttendance.map(report => {
    const total = report.totalPresent + report.totalAbsent;
    const presentPercentage = total > 0 ? (report.totalPresent / total) * 100 : 0;
    const absentPercentage = total > 0 ? (report.totalAbsent / total) * 100 : 0;
    return {
      name: `Week ${report.weekNumber - cohortStartWeek + 1}`,
      present: presentPercentage,
      absent: absentPercentage,
    };
  });

  // Calculate program completion percentage
  const programCompletion = 75; // 75% complete

  // Priority distribution - transform data for better visualization
  const priorityData = [
    { name: 'P0', value: googleSheetsService.getPriorityCount('P0') },
    { name: 'P1', value: googleSheetsService.getPriorityCount('P1') },
    { name: 'P2', value: googleSheetsService.getPriorityCount('P2') },
    { name: 'P3', value: googleSheetsService.getPriorityCount('P3') },
    { name: 'None', value: googleSheetsService.getPriorityCount(null) },
  ];

  // Status distribution - transform data for better visualization
  const statusData = [
    { name: 'In Progress', value: googleSheetsService.getStatusCount('In Progress') },
    { name: 'Call Later', value: googleSheetsService.getStatusCount('Call Later') },
    { name: 'Support Needed', value: googleSheetsService.getStatusCount('Support Needed') },
    { name: 'Completed', value: googleSheetsService.getStatusCount('Completed') },
    { name: 'DNR', value: googleSheetsService.getStatusCount('DNR') },
    { name: 'Message Sent', value: googleSheetsService.getStatusCount('Message Sent') },
  ];

  return (
    <div className="space-y-6">
      {/* Program Progress */}
      {/* <Card>
        <CardHeader className="pb-2">
          <CardTitle>Program Progress</CardTitle>
          <CardDescription>Overall program completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{programCompletion}%</span>
            </div>
            <Progress value={programCompletion} className="h-2" />
          </div>
        </CardContent>
      </Card> */}

      {/* Attendance Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Weekly Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[650px]">
            <Chart 
              data={chartData}
              type="bar"
              categories={['present', 'absent']}
              index="name"
              colors={['#4ade80', '#f87171']}
              valueFormatter={(value) => `${value}%`}
              stack
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      {/* <Card>
        <CardHeader className="pb-2">
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Mentees by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Chart 
              data={priorityData}
              type="pie"
              category="value"
              index="name"
              colors={['#ef4444', '#f97316', '#facc15', '#60a5fa', '#d1d5db']}
              valueFormatter={(value) => `${value} mentees`}
              showLegend={true}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Status Distribution */}
      {/* <Card>
        <CardHeader className="pb-2">
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Mentees by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <Chart 
              data={statusData}
              type="donut"
              category="value"
              index="name"
              colors={['#60a5fa', '#f97316', '#ef4444', '#4ade80', '#d1d5db']}
              valueFormatter={(value) => `${value} mentees`}
              showLegend={true}
            />
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Analytics;
