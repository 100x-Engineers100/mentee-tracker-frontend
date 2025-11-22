import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Mentee {
  id: string;
  name: string;
  poc: string;
  status: string;
}

interface CheckInNote {
  id: string;
  menteeId: string;
  weekNumber: number;
  noteContent: string;
  timestamp: string;
  mentee?: Mentee; // Mentee details will be nested
}

const QuickNotesList: React.FC = () => {
  const [allCheckInNotes, setAllCheckInNotes] = useState<CheckInNote[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedPoc, setSelectedPoc] = useState<string>('all');

  const fetchCheckInNotes = async () => {
    try {
      const params: { cohortBatch: number } = { cohortBatch: 6 };
      const response = await axios.get<CheckInNote[]>(`${import.meta.env.VITE_API_BASE_URL}/checkin-notes`, { params });
      setAllCheckInNotes(response.data);
    } catch (error) {
      console.error('Error fetching check-in notes:', error);
    }
  };

  useEffect(() => {
    fetchCheckInNotes();
  }, []);

  // Client-side filtering for week and POC
  const filteredCheckInNotes = useMemo(() => {
    return allCheckInNotes.filter(note => {
      const matchesWeek = selectedWeek === 'all' || note.weekNumber === parseInt(selectedWeek);
      const matchesPoc = selectedPoc === 'all' || note.mentee?.poc === selectedPoc;
      return matchesWeek && matchesPoc;
    });
  }, [allCheckInNotes, selectedWeek, selectedPoc]);

  const handleWeekChange = (value: string) => {
    setSelectedWeek(value);
  };

  const handlePocChange = (value: string) => {
    setSelectedPoc(value);
  };

  // Generate a list of unique week numbers from ALL fetched notes for the filter dropdown
  const uniqueWeekNumbers = Array.from(new Set(allCheckInNotes.map(note => note.weekNumber))).sort((a, b) => a - b);

  // Generate a list of unique POCs from ALL fetched notes for the filter dropdown
  const uniquePocs = Array.from(new Set(allCheckInNotes.map(note => note.mentee?.poc).filter(Boolean))) as string[];

  return (
    <Card className="sticky top-0 z-10 bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Check-in Notes (Cohort 6)
        </CardTitle>
        <CardDescription>
          Total Notes: {filteredCheckInNotes.length}
        </CardDescription>
        <div className="flex items-center space-x-2">
          <label htmlFor="week-filter" className="text-sm font-medium">Filter by Week:</label>
          <Select onValueChange={handleWeekChange} value={selectedWeek}>
            <SelectTrigger id="week-filter" className="w-[180px]">
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {uniqueWeekNumbers.map((week) => (
                <SelectItem key={week} value={String(week)}>Week {week}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label htmlFor="poc-filter" className="text-sm font-medium">Filter by POC:</label>
          <Select onValueChange={handlePocChange} value={selectedPoc}>
            <SelectTrigger id="poc-filter" className="w-[180px]">
              <SelectValue placeholder="All POCs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All POCs</SelectItem>
              {uniquePocs.map((poc) => (
                <SelectItem key={poc} value={poc}>{poc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentee Name</TableHead>
              <TableHead>POC</TableHead>
              <TableHead>Week Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check-in Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCheckInNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No check-in notes found.</TableCell>
              </TableRow>
            ) : (
              filteredCheckInNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.mentee?.name}</TableCell>
                  <TableCell>{note.mentee?.poc}</TableCell>
                  <TableCell>{note.weekNumber}</TableCell>
                  <TableCell>{note.mentee?.status}</TableCell>
                  <TableCell>{note.noteContent}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuickNotesList;