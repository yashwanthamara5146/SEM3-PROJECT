// Database Service Layer for Course Management System
// This simulates a real database with comprehensive user and course management

export interface User {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName: string;
  lastName: string;
  role: 'student' | 'admin' | 'instructor';
  studentId?: string;
  year?: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior';
  major?: string;
  gpa?: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: number;
  instructorId: string;
  instructorName: string;
  schedule: string;
  location: string;
  capacity: number;
  enrolled: number;
  waitlisted: number;
  prerequisites: string[];
  department: string;
  semester: string;
  year: string;
  status: 'draft' | 'active' | 'archived' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  studentId: string;
  courseId: string;
  status: 'registered' | 'waitlisted' | 'dropped' | 'pending' | 'completed';
  registrationDate: string;
  dropDate?: string;
  grade?: string;
  semester: string;
  year: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  location: string;
}

// Mock Database - In production, this would connect to Supabase/PostgreSQL
class DatabaseService {
  private users: User[] = [
    {
      id: 'user-1',
      email: 'john.doe@university.edu',
      password: 'password123', // Would be hashed in real app
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      studentId: 'STU001',
      year: 'Junior',
      major: 'Computer Science',
      gpa: 3.7,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      isActive: true
    },
    {
      id: 'user-2',
      email: 'jane.smith@university.edu',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'student',
      studentId: 'STU002',
      year: 'Senior',
      major: 'Computer Science',
      gpa: 3.9,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z',
      isActive: true
    },
    {
      id: 'user-3',
      email: 'admin@university.edu',
      password: 'admin123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'user-4',
      email: 'michael.chen@university.edu',
      password: 'instructor123',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'instructor',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      isActive: true
    }
  ];

  private courses: Course[] = [
    {
      id: 'course-1',
      code: 'CS101',
      title: 'Introduction to Programming',
      description: 'Fundamental programming concepts using Python. Covers variables, control structures, functions, and basic data structures.',
      credits: 3,
      instructorId: 'user-4',
      instructorName: 'Prof. Michael Chen',
      schedule: 'MWF 9:00-9:50 AM',
      location: 'Computer Lab A',
      capacity: 40,
      enrolled: 35,
      waitlisted: 3,
      prerequisites: [],
      department: 'CS',
      semester: 'Fall',
      year: '2024',
      status: 'active',
      createdAt: '2024-08-01T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z'
    },
    {
      id: 'course-2',
      code: 'CS201',
      title: 'Data Structures',
      description: 'Advanced data structures including arrays, linked lists, trees, and graphs. Algorithm analysis and implementation.',
      credits: 4,
      instructorId: 'user-4',
      instructorName: 'Prof. Michael Chen',
      schedule: 'TTh 2:00-3:50 PM',
      location: 'Engineering 205',
      capacity: 30,
      enrolled: 28,
      waitlisted: 5,
      prerequisites: ['CS101'],
      department: 'CS',
      semester: 'Fall',
      year: '2024',
      status: 'active',
      createdAt: '2024-08-01T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z'
    },
    {
      id: 'course-3',
      code: 'MATH245',
      title: 'Discrete Mathematics',
      description: 'Logic, sets, functions, relations, graphs, and combinatorics with applications to computer science.',
      credits: 3,
      instructorId: 'user-5',
      instructorName: 'Dr. Emily Davis',
      schedule: 'MWF 10:00-10:50 AM',
      location: 'Math Building 101',
      capacity: 45,
      enrolled: 42,
      waitlisted: 2,
      prerequisites: ['MATH101'],
      department: 'MATH',
      semester: 'Fall',
      year: '2024',
      status: 'active',
      createdAt: '2024-08-01T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z'
    }
  ];

  private registrations: Registration[] = [
    {
      id: 'reg-1',
      studentId: 'user-1',
      courseId: 'course-1',
      status: 'registered',
      registrationDate: '2024-08-15T00:00:00Z',
      semester: 'Fall',
      year: '2024'
    },
    {
      id: 'reg-2',
      studentId: 'user-1',
      courseId: 'course-3',
      status: 'registered',
      registrationDate: '2024-08-15T00:00:00Z',
      semester: 'Fall',
      year: '2024'
    },
    {
      id: 'reg-3',
      studentId: 'user-1',
      courseId: 'course-2',
      status: 'waitlisted',
      registrationDate: '2024-08-20T00:00:00Z',
      semester: 'Fall',
      year: '2024'
    }
  ];

  private schedules: Schedule[] = [
    {
      id: 'sched-1',
      courseId: 'course-1',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '09:50',
      location: 'Computer Lab A'
    },
    {
      id: 'sched-2',
      courseId: 'course-1',
      dayOfWeek: 'Wednesday',
      startTime: '09:00',
      endTime: '09:50',
      location: 'Computer Lab A'
    },
    {
      id: 'sched-3',
      courseId: 'course-1',
      dayOfWeek: 'Friday',
      startTime: '09:00',
      endTime: '09:50',
      location: 'Computer Lab A'
    }
  ];

  // User Management Methods
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email && u.password === password && u.isActive);
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.users[userIndex].isActive = false;
    this.users[userIndex].updatedAt = new Date().toISOString();
    return true;
  }

  async getStudents(): Promise<User[]> {
    return this.users.filter(u => u.role === 'student' && u.isActive);
  }

  async getInstructors(): Promise<User[]> {
    return this.users.filter(u => u.role === 'instructor' && u.isActive);
  }

  // Course Management Methods
  async getAllCourses(): Promise<Course[]> {
    return [...this.courses];
  }

  async getCourseById(id: string): Promise<Course | null> {
    return this.courses.find(c => c.id === id) || null;
  }

  async getCoursesByDepartment(department: string): Promise<Course[]> {
    return this.courses.filter(c => c.department === department);
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return this.courses.filter(c => c.instructorId === instructorId);
  }

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolled' | 'waitlisted'>): Promise<Course> {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      enrolled: 0,
      waitlisted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return null;

    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.courses[courseIndex];
  }

  async deleteCourse(id: string): Promise<boolean> {
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) return false;

    this.courses.splice(courseIndex, 1);
    return true;
  }

  async searchCourses(query: string): Promise<Course[]> {
    const searchTerm = query.toLowerCase();
    return this.courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm) ||
      course.code.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.instructorName.toLowerCase().includes(searchTerm)
    );
  }

  // Registration Management Methods
  async getRegistrationsByStudent(studentId: string): Promise<Registration[]> {
    return this.registrations.filter(r => r.studentId === studentId);
  }

  async getRegistrationsByCourse(courseId: string): Promise<Registration[]> {
    return this.registrations.filter(r => r.courseId === courseId);
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return [...this.registrations];
  }

  async createRegistration(registrationData: Omit<Registration, 'id'>): Promise<Registration> {
    // Check if student is already registered for this course
    const existing = this.registrations.find(r => 
      r.studentId === registrationData.studentId && 
      r.courseId === registrationData.courseId &&
      r.status !== 'dropped'
    );

    if (existing) {
      throw new Error('Student is already registered for this course');
    }

    // Check course capacity
    const course = await this.getCourseById(registrationData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const currentRegistrations = this.registrations.filter(r => 
      r.courseId === registrationData.courseId && 
      r.status === 'registered'
    ).length;

    const status = currentRegistrations >= course.capacity ? 'waitlisted' : 'registered';

    const newRegistration: Registration = {
      ...registrationData,
      id: `reg-${Date.now()}`,
      status
    };

    this.registrations.push(newRegistration);

    // Update course enrollment counts
    await this.updateCourseEnrollment(registrationData.courseId);

    return newRegistration;
  }

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
    const regIndex = this.registrations.findIndex(r => r.id === id);
    if (regIndex === -1) return null;

    const oldCourseId = this.registrations[regIndex].courseId;
    
    this.registrations[regIndex] = {
      ...this.registrations[regIndex],
      ...updates
    };

    // Update course enrollment if status changed
    if (updates.status) {
      await this.updateCourseEnrollment(oldCourseId);
    }

    return this.registrations[regIndex];
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const regIndex = this.registrations.findIndex(r => r.id === id);
    if (regIndex === -1) return false;

    const courseId = this.registrations[regIndex].courseId;
    this.registrations.splice(regIndex, 1);
    
    // Update course enrollment
    await this.updateCourseEnrollment(courseId);
    
    return true;
  }

  private async updateCourseEnrollment(courseId: string): Promise<void> {
    const registrations = this.registrations.filter(r => r.courseId === courseId);
    const enrolled = registrations.filter(r => r.status === 'registered').length;
    const waitlisted = registrations.filter(r => r.status === 'waitlisted').length;

    await this.updateCourse(courseId, { enrolled, waitlisted });
  }

  // Schedule Management Methods
  async getSchedulesByCourse(courseId: string): Promise<Schedule[]> {
    return this.schedules.filter(s => s.courseId === courseId);
  }

  async createSchedule(scheduleData: Omit<Schedule, 'id'>): Promise<Schedule> {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: `sched-${Date.now()}`
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null> {
    const schedIndex = this.schedules.findIndex(s => s.id === id);
    if (schedIndex === -1) return null;

    this.schedules[schedIndex] = {
      ...this.schedules[schedIndex],
      ...updates
    };
    return this.schedules[schedIndex];
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const schedIndex = this.schedules.findIndex(s => s.id === id);
    if (schedIndex === -1) return false;

    this.schedules.splice(schedIndex, 1);
    return true;
  }

  // Analytics and Reports
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalCourses: number;
    totalRegistrations: number;
    totalInstructors: number;
    activeCourses: number;
    averageEnrollment: number;
  }> {
    const totalStudents = this.users.filter(u => u.role === 'student' && u.isActive).length;
    const totalCourses = this.courses.length;
    const totalRegistrations = this.registrations.filter(r => r.status === 'registered').length;
    const totalInstructors = this.users.filter(u => u.role === 'instructor' && u.isActive).length;
    const activeCourses = this.courses.filter(c => c.status === 'active').length;
    const averageEnrollment = activeCourses > 0 
      ? Math.round(this.courses.reduce((sum, c) => sum + c.enrolled, 0) / activeCourses)
      : 0;

    return {
      totalStudents,
      totalCourses,
      totalRegistrations,
      totalInstructors,
      activeCourses,
      averageEnrollment
    };
  }

  async getEnrollmentByDepartment(): Promise<{ department: string; enrolled: number }[]> {
    const departments = new Map<string, number>();
    
    this.courses.forEach(course => {
      const current = departments.get(course.department) || 0;
      departments.set(course.department, current + course.enrolled);
    });

    return Array.from(departments.entries()).map(([department, enrolled]) => ({
      department,
      enrolled
    }));
  }

  // Conflict Detection
  async detectScheduleConflicts(studentId: string): Promise<{
    conflictType: 'time' | 'prerequisite';
    message: string;
    courses: string[];
  }[]> {
    const studentRegistrations = await this.getRegistrationsByStudent(studentId);
    const registeredCourses = await Promise.all(
      studentRegistrations
        .filter(r => r.status === 'registered')
        .map(r => this.getCourseById(r.courseId))
    );

    const conflicts: {
      conflictType: 'time' | 'prerequisite';
      message: string;
      courses: string[];
    }[] = [];

    // Check time conflicts (simplified - would need full schedule parsing in real app)
    for (let i = 0; i < registeredCourses.length; i++) {
      for (let j = i + 1; j < registeredCourses.length; j++) {
        const course1 = registeredCourses[i];
        const course2 = registeredCourses[j];
        
        if (course1 && course2 && course1.schedule === course2.schedule) {
          conflicts.push({
            conflictType: 'time',
            message: `Time conflict between ${course1.code} and ${course2.code}`,
            courses: [course1.code, course2.code]
          });
        }
      }
    }

    return conflicts;
  }
}

// Singleton instance
export const db = new DatabaseService();

// Helper functions for common operations
export const userService = {
  async login(email: string, password: string) {
    return await db.authenticateUser(email, password);
  },
  
  async register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return await db.createUser(userData);
  },
  
  async getProfile(userId: string) {
    return await db.getUserById(userId);
  }
};

export const courseService = {
  async getAll() {
    return await db.getAllCourses();
  },
  
  async search(query: string) {
    return await db.searchCourses(query);
  },
  
  async getByDepartment(department: string) {
    return await db.getCoursesByDepartment(department);
  }
};

export const registrationService = {
  async register(studentId: string, courseId: string) {
    return await db.createRegistration({
      studentId,
      courseId,
      status: 'pending',
      registrationDate: new Date().toISOString(),
      semester: 'Fall',
      year: '2024'
    });
  },
  
  async drop(registrationId: string) {
    return await db.updateRegistration(registrationId, { 
      status: 'dropped',
      dropDate: new Date().toISOString()
    });
  },
  
  async getStudentSchedule(studentId: string) {
    return await db.getRegistrationsByStudent(studentId);
  }
};