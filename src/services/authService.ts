// Simple authentication service that mimics Firebase Auth functionality
// In production, this would be replaced with Firebase Auth or another auth provider

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operations";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock users for development
const mockUsers: User[] = [
  {
    id: "1",
    name: "Shipra",
    email: "shipra@100xengineers.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Siddhant",
    email: "siddhant@100xengineers.com",
    role: "admin",
  },
  {
    id: "3",
    name: "Yatish",
    email: "yatish@100xengineers.com",
    role: "admin",
  },
  {
    id: "4",
    name: "Omkar Thorat",
    email: "omkar@100xengineers.com",
    role: "operations",
  },
  {
    id: "5",
    name: "Omkar Wankhede",
    email: "omkar.wankhede@100xengineers.com",
    role: "operations",
  },
];

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Check if user is already logged in from sessionStorage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userJson = sessionStorage.getItem("menteeTracker_currentUser");
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
      } catch (error) {
        console.error("Failed to parse user from sessionStorage");
        this.currentUser = null;
      }
    }
  }

  private saveUserToStorage(user: User | null) {
    if (user) {
      sessionStorage.setItem("menteeTracker_currentUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("menteeTracker_currentUser");
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // In production, this would validate against a real auth system
    // For now, check against mock users (simplified, no real password check)
    const user = mockUsers.find(
      (u) =>
        u.email === credentials.email &&
        credentials.password === "100xengineers"
    );

    if (user) {
      this.currentUser = user;
      this.saveUserToStorage(user);
      return user;
    }

    throw new Error("Invalid email or password");
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.saveUserToStorage(null);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}

export const authService = new AuthService();
