
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface QuickNotesProps {
  menteeId?: string;
  onAddNote?: (note: string) => void;
}

const QuickNotes: React.FC<QuickNotesProps> = ({ menteeId, onAddNote }) => {
  const { toast } = useToast();
  const [noteText, setNoteText] = React.useState('');

  const noteTemplates = [
    "Left voicemail requesting callback.",
    "Discussed missed sessions. Student will attend next class.",
    "Technical issues prevented attendance. Support provided.",
    "Student needs assistance with course materials.",
    "Follow-up scheduled for next week.",
    "No response to follow-up attempts.",
    "Student is now back on track with attendance."
  ];

  const handleTemplateClick = (template: string) => {
    setNoteText(template);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast({
        title: "Note required",
        description: "Please enter a note or select a template",
        variant: "destructive",
      });
      return;
    }

    if (onAddNote) {
      onAddNote(noteText);
      setNoteText('');
      toast({
        title: "Note added",
        description: "Your note has been saved successfully",
      });
    } else {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully",
      });
      setNoteText('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Quick Note Templates</label>
        <div className="flex flex-wrap gap-2">
          {noteTemplates.map((template, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm" 
              onClick={() => handleTemplateClick(template)}
              className="text-xs"
            >
              {template.length > 30 ? `${template.substring(0, 30)}...` : template}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="note-text" className="text-sm font-medium mb-2 block">Note</label>
        <Textarea 
          id="note-text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Enter note or select a template..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAddNote}>
          Add Note
        </Button>
      </div>
    </div>
  );
};

export default QuickNotes;
