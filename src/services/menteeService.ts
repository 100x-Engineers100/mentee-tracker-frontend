import axios from "axios";

export interface Mentee {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  role: string;
  status: string;
  currentWeek?: number | null;
  registration_number: string;
  user_username: string;
  phone: string;
  contact_number_2: string | null;
  organization_ids: string[];
  parent_name: string | null;
  parent_contact_number: string | null;
  parent_email: string | null;
  is_archived: string;
  contact_number_country_id: string | null;
  contact_number_2_country_id: string | null;
  parent_contact_number_country_id: string | null;
  date: string;
  time: string;
  formatted_date: string;
  lastAttendance: string | null;
  poc?: string | null;
  contact_number_dial_code: string;
  contact_number_2_dial_code: string;
  parent_contact_number_dial_code: string;
  priority?: "P0" | "P1" | "P2" | "P3" | "P4" | null;
  attendancePercentage?: number | null;
}

class MenteeService {
  private API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  async getMentees(cohortBatch?: string): Promise<Mentee[]> {
    try {
      const params = cohortBatch ? { cohort_batch: cohortBatch } : {};
      const response = await axios.get<Mentee[]>(
        `${this.API_BASE_URL}/mentees`,
        { params }
      );
      const mentees = response.data;

      // Define the order of priorities
      const priorityOrder = {
        P0: 0,
        P1: 1,
        P2: 2,
        P3: 3,
        P4: 4,
        null: 5, // null or undefined priorities come last
      };

      // Sort mentees by priority
      mentees.sort((a, b) => {
        const priorityA = a.priority !== undefined ? a.priority : null;
        const priorityB = b.priority !== undefined ? b.priority : null;
        return priorityOrder[priorityA] - priorityOrder[priorityB];
      });

      return mentees;
    } catch (error) {
      console.error("Error fetching mentees:", error);
      throw error;
    }
  }
}

export const menteeService = new MenteeService();
