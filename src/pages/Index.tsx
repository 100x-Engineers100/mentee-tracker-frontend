
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import DashboardCard from '@/components/DashboardCard';
import { Users, CalendarCheck, UserPlus, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios'; // Add axios import

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [totalMenteesBatch6, setTotalMenteesBatch6] = useState(0);
  const [checkInsDue, setCheckInsDue] = useState(0);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // Define API_BASE_URL

    const fetchMenteeCounts = async () => {
      try {
        const batch6Response = await axios.get(`${API_BASE_URL}/mentees/count/batch6`); // Use axios
        setTotalMenteesBatch6(batch6Response.data.count);

        const checkinsResponse = await axios.get(`${API_BASE_URL}/mentees/count/checkins-due/6`); // Use axios
        setCheckInsDue(checkinsResponse.data.count);
      } catch (error) {
        console.error('Failed to fetch mentee counts:', error);
      }
    };

    fetchMenteeCounts();
  }, []);

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  // If not authenticated, this would never render due to the ProtectedRoute wrapper
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Welcome to Mentee Tracker</h1>
          <p className="text-lg text-gray-200">
            Your central hub for managing mentorship programs
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* C4 Mentee Tracker - Main Card */}
          <DashboardCard
            title="C6 Mentee Dashboard"
            icon={<LayoutDashboard size={24} />}
            large={true}
            className="bg-mentee-orange/10 border-mentee-orange/20 dark:bg-mentee-orange/20 dark:border-mentee-orange/30"
            onClick={handleNavigateToDashboard}
          >
            <p className="text-sm text-gray-100 mb-4">
              Access detailed mentee tracking and attendance management
            </p>
            <div className="mt-auto">
              <button className="px-4 py-2 bg-mentee-orange text-white rounded-md hover:bg-mentee-orange/90 transition-colors">
                Go to Dashboard
              </button>
            </div>
          </DashboardCard>

          {/* New Program Card */}
          <DashboardCard
            title="New Program"
            icon={<PlusCircle size={24} />}
            disabled={true}
            className='text-black'
            badge="Coming Soon"
          >
            <p className="text-sm text-black">
              Start tracking a new mentorship program
            </p>
          </DashboardCard>

          {/* Active Programs Card */}
          <DashboardCard
            title="Active Programs"
            icon={<Users size={24} />}
            className='text-black'
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-black">3</span> {/* Change to 0 */}
              <span className="text-sm text-gray-900">Programs in progress</span>
            </div>
          </DashboardCard>

          {/* Total Mentees Card */}
          <DashboardCard
            title="Total Mentees"
            icon={<UserPlus size={24} />}
            className='text-black'
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-black">{totalMenteesBatch6}</span>
              <span className="text-sm text-gray-900">Batch 6 Mentees</span>
            </div>
          </DashboardCard>

          {/* Check-ins Due Card */}
          <DashboardCard
            title="Check-ins Due"
            icon={<CalendarCheck size={24} />}
            className='text-black'
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-1 text-black">{checkInsDue}</span>
              <span className="text-sm text-gray-900">Pending this week</span>
            </div>
          </DashboardCard>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-900">
        <p>© {new Date().getFullYear()} Mentee Tracker • All rights reserved</p>
      </footer>
    </div>
  );
};

export default Index;
