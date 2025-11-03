// Shared types for the application

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  year?: string;
  major?: string;
  status: "approved" | "pending" | "rejected";
}

export interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  schedule: string;
  location: string;
  capacity: number;
  enrolled: number;
  prerequisites: string[];
  description: string;
  status: string;
  semester: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ConflictDetails {
  type: 'schedule' | 'capacity' | 'prerequisite' | 'location';
  conflictingCourse: Course;
  message: string;
  suggestions?: string[];
}