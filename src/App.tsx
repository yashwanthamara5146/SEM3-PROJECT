import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { CourseSelection } from './components/CourseSelection';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { AdminPanel } from './components/AdminPanel';
import { RegistrationManagement } from './components/RegistrationManagement';
import { DatabaseManagement } from './components/DatabaseManagement';
import { ConflictResolution } from './components/ConflictResolution';
import { LoginPage } from './components/LoginPage';
import { User as UserIcon, GraduationCap, Calendar, Settings, Users, Database, LogOut } from 'lucide-react';
import { User, Course } from './types';

// Shared course data
const initialCourses: Course[] = [
  {
    id: 1,
    code: "CS101",
    title: "Introduction to Programming",
    credits: 3,
    instructor: "Dr. Sarah Johnson",
    schedule: "MWF 9:00-9:50 AM",
    location: "Computer Lab A",
    capacity: 40,
    enrolled: 35,
    prerequisites: [],
    description: "Fundamental programming concepts using Python. Covers variables, control structures, functions, and basic data structures.",
    status: "active",
    semester: "Fall 2024"
  },
  {
    id: 2,
    code: "CS201",
    title: "Data Structures",
    credits: 4,
    instructor: "Prof. Michael Chen",
    schedule: "TTh 2:00-3:50 PM",
    location: "Engineering 205",
    capacity: 30,
    enrolled: 28,
    prerequisites: ["CS101"],
    description: "Advanced data structures including arrays, linked lists, trees, and graphs. Algorithm analysis and implementation.",
    status: "active",
    semester: "Fall 2024"
  },
  {
    id: 3,
    code: "MATH245",
    title: "Discrete Mathematics",
    credits: 3,
    instructor: "Dr. Emily Davis",
    schedule: "MWF 10:00-10:50 AM",
    location: "Math Building 101",
    capacity: 45,
    enrolled: 42,
    prerequisites: ["MATH101"],
    description: "Logic, sets, functions, relations, graphs, and combinatorics with applications to computer science.",
    status: "active",
    semester: "Fall 2024"
  },
  {
    id: 4,
    code: "CS301",
    title: "Database Systems",
    credits: 3,
    instructor: "Dr. Robert Wilson",
    schedule: "MW 1:00-2:15 PM",
    location: "Computer Lab B",
    capacity: 25,
    enrolled: 20,
    prerequisites: ["CS201"],
    description: "Database design, SQL, normalization, transactions, and database management systems.",
    status: "active",
    semester: "Fall 2024"
  },
  {
    id: 5,
    code: "ENG102",
    title: "Technical Writing",
    credits: 3,
    instructor: "Prof. Lisa Anderson",
    schedule: "TTh 11:00-12:15 PM",
    location: "Liberal Arts 310",
    capacity: 35,
    enrolled: 25,
    prerequisites: ["ENG101"],
    description: "Writing skills for technical and professional communication. Reports, proposals, and documentation.",
    status: "active",
    semester: "Fall 2024"
  }
];

// Mock pending users for admin approval
const initialPendingUsers: User[] = [
  {
    id: 3,
    name: "Alice Smith",
    email: "alice.smith@university.edu",
    role: "student",
    year: "Sophomore",
    major: "Mathematics",
    status: "pending"
  },
  {
    id: 4,
    name: "Bob Johnson",
    email: "bob.johnson@university.edu",
    role: "student",
    year: "Freshman",
    major: "Engineering",
    status: "pending"
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [courses, setCourses] = useState(initialCourses);
  const [registeredCourses, setRegisteredCourses] = useState<number[]>([1, 3]); // Mock enrolled courses
  const [pendingUsers, setPendingUsers] = useState<User[]>(initialPendingUsers);

  // Authentication functions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === "admin" ? "admin" : "browse");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("browse");
  };

  const handleApproveUser = (userId: number) => {
    setPendingUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "approved" as const } : user
    ));
  };

  const handleRejectUser = (userId: number) => {
    setPendingUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: "rejected" as const } : user
    ));
  };

  // Course management functions for admin
  const handleAddCourse = (newCourse: any) => {
    const course = {
      ...newCourse,
      id: Date.now(),
      enrolled: 0,
      prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map((p: string) => p.trim()) : []
    };
    setCourses(prev => [...prev, course]);
  };

  const handleUpdateCourse = (courseId: number, updatedCourse: any) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, ...updatedCourse } : course
    ));
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    // Also remove from registered courses if student was enrolled
    setRegisteredCourses(prev => prev.filter(id => id !== courseId));
  };

  const handleUpdateCourseStatus = (courseId: number, status: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, status } : course
    ));
  };

  // Enhanced conflict checking
  const checkDetailedConflicts = (newCourseId: number) => {
    const newCourse = courses.find(c => c.id === newCourseId);
    if (!newCourse) return [];

    const conflicts: any[] = [];

    // Parse schedule function
    const parseSchedule = (schedule: string) => {
      const scheduleMatch = schedule.match(/([MTWRFSU]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s+(AM|PM)/);
      if (!scheduleMatch) return [];
      
      const [, dayPattern, startTime, endTime, period] = scheduleMatch;
      const dayMap: { [key: string]: string } = {
        'M': 'Monday', 'T': 'Tuesday', 'W': 'Wednesday', 'R': 'Thursday', 'F': 'Friday'
      };
      
      let days: string[] = [];
      if (dayPattern === 'TTh') {
        days = ['Tuesday', 'Thursday'];
      } else {
        days = dayPattern.split('').map(d => dayMap[d]).filter(Boolean);
      }
      
      const convertTime = (time: string, period: string) => {
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
      };
      
      const start24 = convertTime(startTime, period);
      const end24 = convertTime(endTime, period);
      
      return days.map(day => ({ day, startTime: start24, endTime: end24 }));
    };

    const newSchedule = parseSchedule(newCourse.schedule);
    
    // Check schedule conflicts
    for (const registeredId of registeredCourses) {
      const registeredCourse = courses.find(c => c.id === registeredId);
      if (!registeredCourse) continue;
      
      const registeredSchedule = parseSchedule(registeredCourse.schedule);
      
      for (const newSlot of newSchedule) {
        for (const existingSlot of registeredSchedule) {
          if (newSlot.day === existingSlot.day) {
            const overlap = (newSlot.startTime < existingSlot.endTime && newSlot.endTime > existingSlot.startTime);
            if (overlap) {
              conflicts.push({
                type: 'schedule',
                message: `Schedule conflict with ${registeredCourse.code} on ${newSlot.day}`,
                conflictingCourse: registeredCourse
              });
            }
          }
        }
      }
    }

    // Check capacity
    if (newCourse.enrolled >= newCourse.capacity) {
      conflicts.push({
        type: 'capacity',
        message: `Course is at full capacity (${newCourse.enrolled}/${newCourse.capacity})`,
        conflictingCourse: newCourse
      });
    }

    return conflicts;
  };

  // Student course registration functions
  const handleRegisterCourse = (courseId: number) => {
    const conflicts = checkDetailedConflicts(courseId);
    
    if (conflicts.length > 0) {
      // Conflicts will be handled by the CourseSelection component
      return;
    }
    
    setRegisteredCourses(prev => [...prev, courseId]);
    // Update enrollment count
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, enrolled: course.enrolled + 1 } : course
    ));
  };

  const handleUnregisterCourse = (courseId: number) => {
    setRegisteredCourses(prev => prev.filter(id => id !== courseId));
    // Update enrollment count
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, enrolled: Math.max(0, course.enrolled - 1) } : course
    ));
  };

  // Show login page if no user is logged in
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        pendingUsers={pendingUsers}
        onApproveUser={handleApproveUser}
        onRejectUser={handleRejectUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Course Scheduler</h1>
                <p className="text-sm text-muted-foreground">FEDF-PS48 Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{currentUser.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={currentUser.role === "admin" ? "destructive" : "default"}>
                    {currentUser.role === "admin" ? "Administrator" : "Student"}
                  </Badge>
                  {currentUser.role === "student" && (
                    <span className="text-sm text-muted-foreground">
                      {currentUser.year} • {currentUser.major}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            {currentUser.role === "student" ? (
              <>
                <TabsTrigger value="browse" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Browse Courses
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  My Schedule
                </TabsTrigger>
                <TabsTrigger value="registrations" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Registrations
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="admin" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Course Management
                </TabsTrigger>
                <TabsTrigger value="registrations" className="gap-2">
                  <Users className="h-4 w-4" />
                  Student Registrations
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Overview
                </TabsTrigger>
                <TabsTrigger value="conflicts" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Resolve Conflicts
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {currentUser.role === "student" ? (
            <>
              <TabsContent value="browse">
                <CourseSelection 
                  courses={courses}
                  registeredCourses={registeredCourses}
                  onRegister={handleRegisterCourse}
                  onUnregister={handleUnregisterCourse}
                />
              </TabsContent>
              
              <TabsContent value="schedule">
                <ScheduleBuilder courses={courses} registeredCourses={registeredCourses} />
              </TabsContent>
              
              <TabsContent value="registrations">
                <RegistrationManagement userRole="student" />
              </TabsContent>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Name</label>
                        <p>{currentUser.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p>{currentUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Year</label>
                        <p>{currentUser.year}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Major</label>
                        <p>{currentUser.major}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Status</label>
                        <Badge className="w-fit">{currentUser.status}</Badge>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Registered Courses</label>
                        <p>{registeredCourses.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="database">
                <DatabaseManagement currentUser={currentUser} />
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="admin">
                <AdminPanel 
                  courses={courses}
                  onAddCourse={handleAddCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onUpdateStatus={handleUpdateCourseStatus}
                />
              </TabsContent>
              
              <TabsContent value="registrations">
                <RegistrationManagement userRole="admin" />
              </TabsContent>
              
              <TabsContent value="schedule">
                <ScheduleBuilder courses={courses} registeredCourses={registeredCourses} />
              </TabsContent>
              
              <TabsContent value="conflicts">
                <ConflictResolution 
                  courses={courses}
                  onUpdateCourse={handleUpdateCourse}
                />
              </TabsContent>
              
              <TabsContent value="database">
                <DatabaseManagement currentUser={currentUser} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}