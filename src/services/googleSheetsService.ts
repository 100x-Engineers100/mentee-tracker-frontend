
// This interface defines the structure of attendance data
export interface AttendanceRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  attendanceStatus: boolean[];
  missedClasses: number;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | null;
  lastAttendance: string | null;
  status: 'In Progress' | 'Call Later' | 'Support Needed' | 'Completed' | 'DNR';
  currentWeek?: number;
}

// This interface defines the structure of a check-in note
export interface CheckInNote {
  id: string;
  menteeId: string;
  timestamp: string;
  note: string;
  executiveName: string;
}

// Mock data for development (will be replaced with actual API calls)
const mockMentees: AttendanceRecord[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    attendanceStatus: [false, false, false, false], // Missed 4 classes
    missedClasses: 4,
    priority: 'P0',
    lastAttendance: '2025-04-16',
    status: 'Support Needed',
    currentWeek: 4,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '234-567-8901',
    attendanceStatus: [false, false, false, true], // Missed 3 classes
    missedClasses: 3,
    priority: 'P1',
    lastAttendance: '2025-05-07',
    status: 'Call Later',
    currentWeek: 4,
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '345-678-9012',
    attendanceStatus: [false, false, true, true], // Missed 2 classes
    missedClasses: 2,
    priority: 'P2',
    lastAttendance: '2025-05-01',
    status: 'In Progress',
    currentWeek: 4,
  },
  {
    id: '4',
    name: 'Bob Brown',
    email: 'bob.brown@example.com',
    phone: '456-789-0123',
    attendanceStatus: [false, true, true, true], // Missed 1 class
    missedClasses: 1,
    priority: 'P3',
    lastAttendance: '2025-05-07',
    status: 'In Progress',
    currentWeek: 4,
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    phone: '567-890-1234',
    attendanceStatus: [true, true, true, true], // No missed classes
    missedClasses: 0,
    priority: null,
    lastAttendance: '2025-05-14',
    status: 'Completed',
    currentWeek: 4,
  },
];

const mockNotes: CheckInNote[] = [
  {
    id: '101',
    menteeId: '1',
    timestamp: '2025-05-12T14:22:00Z',
    note: 'Called to check on absence. Student reported technical issues.',
    executiveName: 'Sarah Manager',
  },
  {
    id: '102',
    menteeId: '1',
    timestamp: '2025-05-14T10:15:00Z',
    note: 'Follow-up call. Student will attend next session.',
    executiveName: 'Sarah Manager',
  },
  {
    id: '103',
    menteeId: '2',
    timestamp: '2025-05-13T09:30:00Z',
    note: 'Left voicemail requesting callback.',
    executiveName: 'Mike Coordinator',
  },
];

// This class will handle Google Sheets API integration
class GoogleSheetsService {
  private auth: any | null = null;

  constructor() {
    // Initialize authentication will be implemented when connecting to real API
    console.log('Google Sheets Service initialized');
  }

  /**
   * Fetches attendance data from the Google Sheet
   * In production, this will use the Google Sheets API
   */
  async getAttendanceData(): Promise<AttendanceRecord[]> {
    // In production, this will fetch from Google Sheets API
    // For now, return mock data
    return mockMentees;
  }

  /**
   * Fetches check-in notes for a specific mentee
   */
  async getMenteeNotes(menteeId: string): Promise<CheckInNote[]> {
    // In production, this will fetch from Google Sheets API
    // For now, filter mock data
    return mockNotes.filter(note => note.menteeId === menteeId);
  }

  /**
   * Adds a new check-in note
   */
  async addCheckInNote(note: Omit<CheckInNote, 'id'>): Promise<CheckInNote> {
    // In production, this will add to Google Sheets API
    // For now, simulate adding to mock data
    const newNote: CheckInNote = {
      ...note,
      id: Date.now().toString(),
    };
    
    mockNotes.push(newNote);
    return newNote;
  }

  /**
   * Updates an existing check-in note
   */
  async updateCheckInNote(note: CheckInNote): Promise<CheckInNote> {
    // In production, this will update in Google Sheets API
    // For now, simulate updating mock data
    const index = mockNotes.findIndex(n => n.id === note.id);
    if (index !== -1) {
      mockNotes[index] = note;
      return note;
    }
    throw new Error('Note not found');
  }

  /**
   * Categorizes mentees into priority buckets (P0-P3)
   */
  categorizeMentees(mentees: AttendanceRecord[]): AttendanceRecord[] {
    return mentees.map(mentee => {
      const missedClasses = mentee.attendanceStatus.filter(status => !status).length;
      
      let priority: 'P0' | 'P1' | 'P2' | 'P3' | null = null;
      
      if (missedClasses === 4) {
        priority = 'P0';
      } else if (missedClasses === 3) {
        priority = 'P1';
      } else if (missedClasses === 2) {
        priority = 'P2';
      } else if (missedClasses === 1) {
        priority = 'P3';
      }
      
      return {
        ...mentee,
        missedClasses,
        priority,
      };
    });
  }

  /**
   * Refreshes data from Google Sheets
   */
  async refreshData(): Promise<AttendanceRecord[]> {
    // In production, this will actually pull fresh data
    // For now, just return the categorized mock data
    return this.categorizeMentees(mockMentees);
  }

  /**
   * Archives weekly notes to data dump sheet
   */
  async archiveNotes(): Promise<boolean> {
    // In production, this will move data to the Data Dump sheet
    // For now, just log and return success
    console.log('Notes archived to Data Dump');
    return true;
  }

  /**
   * Gets mentee count for a specific priority level
   */
  getPriorityCount(priority: 'P0' | 'P1' | 'P2' | 'P3' | null): number {
    return mockMentees.filter(m => m.priority === priority).length;
  }

  /**
   * Gets mentee count for a specific status
   */
  getStatusCount(status: 'In Progress' | 'Call Later' | 'Support Needed' | 'Completed' | 'DNR'): number {
    return mockMentees.filter(m => m.status === status).length;
  }

  /**
   * Gets attendance rate for a specific week
   */
  getWeeklyAttendanceRate(weekIndex: number): number {
    if (weekIndex < 0 || weekIndex >= 4) return 0;
    
    const totalMentees = mockMentees.length;
    if (totalMentees === 0) return 0;
    
    const presentCount = mockMentees.filter(m => m.attendanceStatus[weekIndex]).length;
    return Math.round((presentCount / totalMentees) * 100);
  }

  /**
   * Generates a weekly summary report
   */
  async generateWeeklySummary(week: 'current' | 'week1' | 'week2' | 'week3' | 'week4', format: string): Promise<string> {
    // In production, this would actually generate a report file
    // For now, log the request and return a mock URL
    console.log(`Generating ${format} report for ${week}`);
    return `https://example.com/reports/weekly-summary-${week}.${format}`;
  }

  /**
   * Uploads and imports new attendance data
   */
  async importAttendanceData(file: File): Promise<AttendanceRecord[]> {
    // In production, this would parse and import the file
    // For now, return mock data
    console.log(`Importing file: ${file.name}`);
    return mockMentees;
  }
}

export const googleSheetsService = new GoogleSheetsService();
