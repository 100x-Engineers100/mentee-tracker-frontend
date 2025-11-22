
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import MenteeList from '@/components/MenteeList';
import Analytics from '@/components/Analytics';
import WeeklySummary from '@/components/WeeklySummary';
import QuickNotesList from '@/components/QuickNotesList';
import PreviewImport from '@/components/PreviewImport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BarChart3, FileText, ListFilter, Users, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { menteeService, Mentee } from '@/services/menteeService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPoc, setFilterPoc] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('mentees');

  const loadMenteeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await menteeService.getMentees('6');
      setMentees(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load mentee data',
        description: 'There was an error loading mentee data. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMenteeData();
  }, [loadMenteeData]);

  const handleUpdateMentee = (updatedMentee: Mentee) => {
    setMentees(prevMentees =>
      prevMentees.map(mentee =>
        mentee.id === updatedMentee.id ? updatedMentee : mentee
      )
    );
  };

  // Filter mentees based on selected criteria
  const filteredMentees = mentees.filter(mentee => {
    // Filter by priority
    if (filterPriority && mentee.priority !== filterPriority) {
      return false;
    }

    // Filter by status
    if (filterStatus && mentee.status !== filterStatus) {
      return false;
    }

    // Filter by POC
    if (filterPoc && mentee.poc !== filterPoc) {
      return false;
    }

    // Filter by search term (name or email)
    if (searchTerm && 
        !mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !mentee.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Count mentees in each priority category
  const priorityCounts = {
    P0: mentees.filter(m => m.priority === 'P0').length,
    P1: mentees.filter(m => m.priority === 'P1').length,
    P2: mentees.filter(m => m.priority === 'P2').length,
    P3: mentees.filter(m => m.priority === 'P3').length,
    P4: mentees.filter(m => m.priority === 'P4').length,
    total: mentees.length
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">C6 Mentee Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.name || 'User'}. Manage your mentee attendance and follow-ups.
              <Link to="/" className="ml-2 text-mentee-orange hover:underline">Back to Home</Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-muted-foreground">Total Mentees</div>
            <div className="text-2xl font-bold">{priorityCounts.total}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-red-200 bg-red-50/30">
            <div className="text-sm text-muted-foreground">P0</div>
            <div className="text-2xl font-bold">{priorityCounts.P0}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-orange-200 bg-orange-50/30">
            <div className="text-sm text-muted-foreground">P1</div>
            <div className="text-2xl font-bold">{priorityCounts.P1}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-yellow-200 bg-yellow-50/30">
            <div className="text-sm text-muted-foreground">P2 </div>
            <div className="text-2xl font-bold">{priorityCounts.P2}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-blue-200 bg-blue-50/30">
            <div className="text-sm text-muted-foreground">P3</div>
            <div className="text-2xl font-bold">{priorityCounts.P3}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm border border-purple-200 bg-purple-50/30">
            <div className="text-sm text-muted-foreground">P4</div>
            <div className="text-2xl font-bold">{priorityCounts.P4}</div>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="mentees" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="mentees" className="flex items-center gap-2">
              <Users size={16} /> Mentees
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 size={16} /> Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText size={16} /> Reports
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <ListFilter size={16} /> Quick Notes
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload size={16} /> Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mentees" className="pt-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input 
                  type="text" 
                  placeholder="Search by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={filterPriority === null ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(null)}
                >
                  All
                </Button>
                <Button 
                  variant={filterPriority === 'P0' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(filterPriority === 'P0' ? null : 'P0')}
                  className="border-red-300"
                >
                  P0
                </Button>
                <Button 
                  variant={filterPriority === 'P1' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(filterPriority === 'P1' ? null : 'P1')}
                  className="border-orange-300"
                >
                  P1
                </Button>
                <Button 
                  variant={filterPriority === 'P2' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(filterPriority === 'P2' ? null : 'P2')}
                  className="border-yellow-300"
                >
                  P2
                </Button>
                <Button 
                  variant={filterPriority === 'P3' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(filterPriority === 'P3' ? null : 'P3')}
                  className="border-blue-300"
                >
                  P3
                </Button>
                <Button 
                  variant={filterPriority === 'P4' ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilterPriority(filterPriority === 'P4' ? null : 'P4')}
                  className="border-purple-300"
                >
                  P4
                </Button>
              </div>
            </div>
            
            {/* Status filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant={filterStatus === null ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus(null)}>
                All Statuses
              </Badge>
              <Badge variant={filterStatus === 'In Progress' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('In Progress')}>
                In Progress
              </Badge>
              <Badge variant={filterStatus === 'Call Later' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('Call Later')}>
                Call Later
              </Badge>
              <Badge variant={filterStatus === 'Support Needed' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('Support Needed')}>
                Support Needed
              </Badge>
              <Badge variant={filterStatus === 'Completed' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('Completed')}>
                Completed
              </Badge>
              <Badge variant={filterStatus === 'DNR' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('DNR')}>
                DNR
              </Badge>
              <Badge variant={filterStatus === 'Message Sent' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterStatus('Message Sent')}>
                Message Sent
              </Badge>
            </div>

            {/* POC filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant={filterPoc === null ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterPoc(null)}>
                All POCs
              </Badge>
              <Badge variant={filterPoc === 'Omkar Wankhede' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterPoc('Omkar Wankhede')}>
                Omkar Wankhede
              </Badge>
              <Badge variant={filterPoc === 'Omkar Thorat' ? "default" : "outline"} className="cursor-pointer hover:bg-accent" onClick={() => setFilterPoc('Omkar Thorat')}>
                Omkar Thorat
              </Badge>
            </div>

            <div className="flex justify-end mb-4">
              <p className="text-lg font-semibold">Total mentees: {filteredMentees.length}</p>
            </div>

            {/* Mentee List */}
            <MenteeList mentees={filteredMentees} isLoading={isLoading} onUpdateMentee={handleUpdateMentee} />
          </TabsContent>

          <TabsContent value="analytics" className="pt-6">
            <Analytics />
          </TabsContent>

          <TabsContent value="reports" className="pt-6">
            <WeeklySummary />
          </TabsContent>

          {/* <TabsContent value="notes" className="pt-6">
            <QuickNotes />
          </TabsContent> */}

          <TabsContent value="notes" className="pt-6 sticky top-0 z-10 bg-background">
            <QuickNotesList />
          </TabsContent>

          <TabsContent value="import" className="pt-6">
            <PreviewImport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
