
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Mentee } from '@/services/menteeService';
import axios from 'axios';

export interface CheckInNote {
  id: string;
  menteeId: string;
  timestamp: string;
  noteContent: string;
  executiveName: string;
}

interface MenteeDetailDialogProps {
  mentee: Mentee;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMentee: (updatedMentee: Mentee) => void;
}

const MenteeDetailDialog: React.FC<MenteeDetailDialogProps> = ({ mentee, isOpen, onClose, onUpdateMentee }) => {
  const [notes, setNotes] = useState<CheckInNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(mentee.status);
  const [selectedPoc, setSelectedPoc] = useState(mentee.poc || '');
  const [selectedPhone, setSelectedPhone] = useState(mentee.phone || '');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && mentee) {
      loadMenteeNotes();
      setSelectedStatus(mentee.status);
      setSelectedPoc(mentee.poc || '');
      setSelectedPhone(mentee.phone || '');
    }
  }, [isOpen, mentee]);

  const loadMenteeNotes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<CheckInNote[]>(`${import.meta.env.VITE_API_BASE_URL}/checkin-notes?menteeId=${mentee.id}`);
      const fetchedNotes = response.data;
      // Sort notes by timestamp, most recent first
      fetchedNotes.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setNotes(fetchedNotes);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load notes',
        description: 'There was an error loading this mentee\'s notes.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMentee = async (field: 'status' | 'poc' | 'phone', value: string | null) => {
    try {
      const response = await axios.put<Mentee>(`${import.meta.env.VITE_API_BASE_URL}/mentees/${mentee.id}`, {
        [field]: value,
      });
      onUpdateMentee(response.data);
      toast({
        title: `${field === 'status' ? 'Status' : field === 'poc' ? 'POC' : 'Phone'} updated`,
        description: `Mentee's ${field === 'status' ? 'status' : field === 'poc' ? 'POC' : 'phone'} has been updated to ${value}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `Failed to update ${field === 'status' ? 'status' : field === 'poc' ? 'POC' : 'phone'}`,
        description: `There was an error updating the mentee's ${field === 'status' ? 'status' : field === 'poc' ? 'POC' : 'phone'}.`,
      });
    }
  };

  const handleStatusChange = async (value: string) => {
    setSelectedStatus(value);
    await handleUpdateMentee('status', value);
  };

  const handlePocChange = async (value: string) => {
    const backendValue = value === 'null' ? null : value;
    setSelectedPoc(value);
    await handleUpdateMentee('poc', backendValue);
  };

  const handlePhoneChange = async (value: string) => {
    const backendValue = value.trim() === '' ? null : value.trim();
    setSelectedPhone(value);
    await handleUpdateMentee('phone', backendValue);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;

    try {
      setIsSaving(true);
      const timestamp = new Date().toISOString();

      const response = await axios.post<CheckInNote>(`${import.meta.env.VITE_API_BASE_URL}/checkin-notes`, {
        mentee: {
          connect: { id: mentee.id }
        },
        timestamp,
        noteContent: newNote.trim(),
        executiveName: user.name,
      });
      const newCheckInNote = response.data;

      setNotes([newCheckInNote, ...notes]); // Add to the beginning
      setNewNote(''); // Clear input

      toast({
        title: 'Note added',
        description: 'Your note has been successfully added.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add note',
        description: 'There was an error adding your note. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingNote = (note: CheckInNote) => {
    setEditingNoteId(note.id);
    setEditedNoteContent(note.noteContent);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditedNoteContent('');
  };

  const saveEditedNote = async (noteId: string) => {
    if (!editedNoteContent.trim()) return;

    try {
      setIsSaving(true);
      const noteToUpdate = notes.find(note => note.id === noteId);

      if (!noteToUpdate) return;

      const response = await axios.put<CheckInNote>(`${import.meta.env.VITE_API_BASE_URL}/checkin-notes/${noteId}`, {
        ...noteToUpdate,
        noteContent: editedNoteContent.trim()
      });
      const updatedNote = response.data;

      // Update the note in the local state
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note));

      // Clear editing state
      setEditingNoteId(null);
      setEditedNoteContent('');

      toast({
        title: 'Note updated',
        description: 'Your note has been successfully updated.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update note',
        description: 'There was an error updating your note. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityLabel = (priority: "P0" | "P1" | "P2" | "P3" | null) => {
    switch (priority) {
      case 'P0': return 'P0';
      case 'P1': return 'P1';
      case 'P2': return 'P2';
      case 'P3': return 'P3';
      default: return 'No Priority';
    }
  };

  const getPriorityColor = (priority: "P0" | "P1" | "P2" | "P3" | null) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800 border-red-200';
      case 'P1': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'P2': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'P3': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Support Needed': return 'bg-red-100 text-red-800 border-red-200';
      case 'Call Later': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'DNR': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl">{mentee.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="ml-2">{mentee.email}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className="text-sm text-muted-foreground">Phone:</span>
                <input
                  type="text"
                  autoFocus={false}
                  value={selectedPhone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) || value === '') {
                      setSelectedPhone(value);
                    }
                  }}
                  onBlur={() => handlePhoneChange(selectedPhone)}
                  className="ml-2 border rounded-md px-2 py-1 bg-background text-foreground w-[180px]"
                />
              </div>
                <div>
                <span className="text-sm text-muted-foreground">Last Attendance:</span>
                <span className="ml-2">
                  {mentee.lastAttendance ?
                    format(new Date(mentee.lastAttendance), 'dd/MM/yyyy') :
                    'Never'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Attendance Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Priority:</span>
                <Badge className={`ml-2 ${getPriorityColor(mentee.priority)}`}>
                  {getPriorityLabel(mentee.priority)} ({mentee.status})
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className="text-sm text-muted-foreground">Status:</span>
                <Select onValueChange={handleStatusChange} value={selectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Support Needed">Support Needed</SelectItem>
                    <SelectItem value="Call Later">Call Later</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                    <SelectItem value="DNR">DNR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-2'>
                <span className="text-sm text-muted-foreground">POC:</span>
                <Select onValueChange={handlePocChange} value={selectedPoc}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select POC" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Omkar Thorat">Omkar Thorat</SelectItem>
                    <SelectItem value="Omkar Wankhede">Omkar Wankhede</SelectItem>
                    <SelectItem value="null">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <h3 className="text-lg font-medium mb-4">Check-in Notes</h3>

          {/* Add new note */}
          <div className="mb-6">
            <Textarea
              placeholder="Add a new check-in note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim() || isSaving}>
              {isSaving ? 'Adding...' : 'Add Note'}
            </Button>
          </div>

          {/* Notes list */}
          <div className="space-y-4 max-h-64 hidden-scrollbar z-10 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No check-in notes yet
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-muted/30 p-4 rounded-md border"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">
                      {note.executiveName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.timestamp), 'dd MMM yyyy, h:mm a')}
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="mt-2">
                      <Textarea
                        value={editedNoteContent}
                        onChange={(e) => setEditedNoteContent(e.target.value)}
                        rows={3}
                        className="mb-2"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => saveEditedNote(note.id)}
                          disabled={!editedNoteContent.trim() || isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditingNote}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 whitespace-pre-wrap">{note.noteContent}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => startEditingNote(note)}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenteeDetailDialog;
