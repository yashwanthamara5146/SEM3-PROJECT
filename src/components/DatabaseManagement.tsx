import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  BookOpen, 
  Database, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { db, User, Course, Registration, userService, courseService } from '../services/database';

interface DatabaseManagementProps {
  currentUser: User;
}

export function DatabaseManagement({ currentUser }: DatabaseManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "student" as "student" | "admin" | "instructor",
    studentId: "",
    year: "Freshman" as "Freshman" | "Sophomore" | "Junior" | "Senior",
    major: ""
  });

  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    description: "",
    credits: 3,
    instructorId: "",
    schedule: "",
    location: "",
    capacity: 30,
    prerequisites: "",
    department: "",
    semester: "Fall",
    year: "2024",
    status: "draft" as "draft" | "active" | "archived"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData, registrationsData, statsData] = await Promise.all([
        db.getAllUsers(),
        db.getAllCourses(),
        db.getAllRegistrations(),
        db.getDashboardStats()
      ]);
      
      setUsers(usersData);
      setCourses(coursesData);
      setRegistrations(registrationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        ...newUser,
        isActive: true
      };
      await db.createUser(userData);
      
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "student",
        studentId: "",
        year: "Freshman",
        major: ""
      });
      
      setIsAddingUser(false);
      loadData();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleAddCourse = async () => {
    try {
      const instructor = users.find(u => u.id === newCourse.instructorId);
      const courseData = {
        ...newCourse,
        instructorName: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'TBD',
        prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map(p => p.trim()) : []
      };
      
      await db.createCourse(courseData);
      
      setNewCourse({
        code: "",
        title: "",
        description: "",
        credits: 3,
        instructorId: "",
        schedule: "",
        location: "",
        capacity: 30,
        prerequisites: "",
        department: "",
        semester: "Fall",
        year: "2024",
        status: "draft"
      });
      
      setIsAddingCourse(false);
      loadData();
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      await db.deleteUser(userId);
      loadData();
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await db.deleteCourse(courseId);
      loadData();
    }
  };

  const handleUpdateCourseStatus = async (courseId: string, status: string) => {
    await db.updateCourse(courseId, { status: status as any });
    loadData();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    
    return matchesSearch && matchesRole && user.isActive;
  });

  const instructors = users.filter(u => u.role === 'instructor');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Database className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Database Management</h2>
          <p className="text-muted-foreground">Manage users, courses, and system data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" className="gap-2">
            <Database className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalInstructors}</p>
                <p className="text-sm text-muted-foreground">Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeCourses}</p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                <p className="text-sm text-muted-foreground">Registrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.averageEnrollment}</p>
                <p className="text-sm text-muted-foreground">Avg Enrollment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Course Management
          </TabsTrigger>
          <TabsTrigger value="registrations" className="gap-2">
            <Calendar className="h-4 w-4" />
            Registration Data
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Database className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Management</CardTitle>
                <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">First Name</label>
                          <Input
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Last Name</label>
                          <Input
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          placeholder="john.doe@university.edu"
                          type="email"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          placeholder="password123"
                          type="password"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Role</label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value) => setNewUser({...newUser, role: value as any})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="instructor">Instructor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {newUser.role === 'student' && (
                          <div>
                            <label className="text-sm font-medium">Student ID</label>
                            <Input
                              value={newUser.studentId}
                              onChange={(e) => setNewUser({...newUser, studentId: e.target.value})}
                              placeholder="STU003"
                            />
                          </div>
                        )}
                      </div>
                      
                      {newUser.role === 'student' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Year</label>
                            <Select 
                              value={newUser.year} 
                              onValueChange={(value) => setNewUser({...newUser, year: value as any})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Freshman">Freshman</SelectItem>
                                <SelectItem value="Sophomore">Sophomore</SelectItem>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Major</label>
                            <Input
                              value={newUser.major}
                              onChange={(e) => setNewUser({...newUser, major: e.target.value})}
                              placeholder="Computer Science"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>
                          Add User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="instructor">Instructors</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'instructor' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.studentId && <Badge variant="outline">{user.studentId}</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span>Email: {user.email}</span>
                        {user.year && <span>Year: {user.year}</span>}
                        {user.major && <span>Major: {user.major}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteUser(user.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Management Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Course Management</CardTitle>
                <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Course Code</label>
                          <Input
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                            placeholder="CS102"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Department</label>
                          <Input
                            value={newCourse.department}
                            onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                            placeholder="CS"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Course Title</label>
                        <Input
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          placeholder="Advanced Programming"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          placeholder="Course description..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Credits</label>
                          <Select 
                            value={newCourse.credits.toString()} 
                            onValueChange={(value) => setNewCourse({...newCourse, credits: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Capacity</label>
                          <Input
                            type="number"
                            value={newCourse.capacity}
                            onChange={(e) => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Instructor</label>
                          <Select 
                            value={newCourse.instructorId} 
                            onValueChange={(value) => setNewCourse({...newCourse, instructorId: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {instructors.map(instructor => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                  {instructor.firstName} {instructor.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Schedule</label>
                          <Input
                            value={newCourse.schedule}
                            onChange={(e) => setNewCourse({...newCourse, schedule: e.target.value})}
                            placeholder="MWF 10:00-10:50 AM"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Location</label>
                          <Input
                            value={newCourse.location}
                            onChange={(e) => setNewCourse({...newCourse, location: e.target.value})}
                            placeholder="Room 101"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Prerequisites (comma-separated)</label>
                        <Input
                          value={newCourse.prerequisites}
                          onChange={(e) => setNewCourse({...newCourse, prerequisites: e.target.value})}
                          placeholder="CS101, MATH101"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCourse}>
                          Add Course
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{course.code}: {course.title}</h4>
                        <Badge 
                          variant={course.status === 'active' ? 'default' : 
                                  course.status === 'draft' ? 'secondary' : 'destructive'}
                        >
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.credits} Credits</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <span>Instructor: {course.instructorName}</span>
                        <span>Enrolled: {course.enrolled}/{course.capacity}</span>
                        <span>Location: {course.location}</span>
                        <span>Schedule: {course.schedule}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={course.status}
                        onValueChange={(value) => handleUpdateCourseStatus(course.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Data Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Registration Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrations.map(registration => {
                  const student = users.find(u => u.id === registration.studentId);
                  const course = courses.find(c => c.id === registration.courseId);
                  
                  return (
                    <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">
                            {student?.firstName} {student?.lastName} → {course?.code}
                          </h4>
                          <Badge 
                            variant={registration.status === 'registered' ? 'default' : 
                                    registration.status === 'waitlisted' ? 'secondary' : 'destructive'}
                          >
                            {registration.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <span>Student ID: {student?.studentId}</span>
                          <span>Course: {course?.title}</span>
                          <span>Date: {new Date(registration.registrationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Database is running smoothly. All services are operational.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Active Users</p>
                      <p className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.isActive).length}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Total Records</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {users.length + courses.length + registrations.length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>New user registration: John Doe</span>
                    <span className="text-muted-foreground text-xs ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span>Course updated: CS101</span>
                    <span className="text-muted-foreground text-xs ml-auto">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span>New registration: Jane Smith → MATH245</span>
                    <span className="text-muted-foreground text-xs ml-auto">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}