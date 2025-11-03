import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface RegistrationManagementProps {
  userRole: 'student' | 'admin';
}

// Mock registration data
const mockRegistrations = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "John Doe",
    courseCode: "CS101",
    courseTitle: "Introduction to Programming",
    status: "registered",
    registrationDate: "2024-08-15",
    credits: 3,
    semester: "Fall 2024"
  },
  {
    id: 2,
    studentId: "STU001", 
    studentName: "John Doe",
    courseCode: "MATH245",
    courseTitle: "Discrete Mathematics",
    status: "registered",
    registrationDate: "2024-08-15",
    credits: 3,
    semester: "Fall 2024"
  },
  {
    id: 3,
    studentId: "STU001",
    studentName: "John Doe", 
    courseCode: "CS201",
    courseTitle: "Data Structures",
    status: "waitlisted",
    registrationDate: "2024-08-20",
    credits: 4,
    semester: "Fall 2024"
  },
  {
    id: 4,
    studentId: "STU002",
    studentName: "Jane Smith",
    courseCode: "CS101", 
    courseTitle: "Introduction to Programming",
    status: "registered",
    registrationDate: "2024-08-16",
    credits: 3,
    semester: "Fall 2024"
  },
  {
    id: 5,
    studentId: "STU002",
    studentName: "Jane Smith",
    courseCode: "ENG102",
    courseTitle: "Technical Writing", 
    status: "dropped",
    registrationDate: "2024-08-16",
    credits: 3,
    semester: "Fall 2024"
  }
];

export function RegistrationManagement({ userRole }: RegistrationManagementProps) {
  const [registrations, setRegistrations] = useState(mockRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter registrations based on user role
  const filteredRegistrations = registrations.filter(reg => {
    if (userRole === 'student') {
      // Students only see their own registrations
      return reg.studentId === "STU001";
    }
    
    // Admin sees all registrations
    const matchesSearch = reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (registrationId: number, newStatus: string) => {
    setRegistrations(prev => prev.map(reg => 
      reg.id === registrationId ? { ...reg, status: newStatus } : reg
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'waitlisted': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'dropped': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'waitlisted': return 'bg-yellow-100 text-yellow-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const stats = {
    total: filteredRegistrations.length,
    registered: filteredRegistrations.filter(r => r.status === 'registered').length,
    waitlisted: filteredRegistrations.filter(r => r.status === 'waitlisted').length,
    dropped: filteredRegistrations.filter(r => r.status === 'dropped').length,
    totalCredits: filteredRegistrations
      .filter(r => r.status === 'registered')
      .reduce((sum, r) => sum + r.credits, 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {userRole === 'student' ? 'My Registrations' : 'Student Registrations'}
        </h2>
        <p className="text-muted-foreground">
          {userRole === 'student' 
            ? 'View and manage your course registrations'
            : 'Manage student course registrations and resolve issues'
          }
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.registered}</p>
              <p className="text-sm text-muted-foreground">Registered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.waitlisted}</p>
              <p className="text-sm text-muted-foreground">Waitlisted</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.dropped}</p>
              <p className="text-sm text-muted-foreground">Dropped</p>
            </div>
          </CardContent>
        </Card>
        
        {userRole === 'student' && (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalCredits}</p>
                <p className="text-sm text-muted-foreground">Credits</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters (Admin only) */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === 'student' ? 'Course Registrations' : 'All Registrations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRegistrations.map(registration => (
              <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">
                      {registration.courseCode}: {registration.courseTitle}
                    </h3>
                    <Badge className={getStatusColor(registration.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(registration.status)}
                        {registration.status}
                      </div>
                    </Badge>
                    <Badge variant="outline">{registration.credits} Credits</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {userRole === 'admin' && (
                      <span>Student: {registration.studentName} ({registration.studentId})</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Registered: {new Date(registration.registrationDate).toLocaleDateString()}
                    </span>
                    <span>Semester: {registration.semester}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {userRole === 'admin' && (
                    <Select
                      value={registration.status}
                      onValueChange={(value) => handleStatusChange(registration.id, value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registered">Registered</SelectItem>
                        <SelectItem value="waitlisted">Waitlisted</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {userRole === 'student' && registration.status === 'registered' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(registration.id, 'dropped')}
                    >
                      Drop Course
                    </Button>
                  )}
                  
                  {userRole === 'student' && registration.status === 'waitlisted' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(registration.id, 'dropped')}
                    >
                      Remove from Waitlist
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {userRole === 'student' 
                    ? 'No registrations found. Start by browsing courses!'
                    : 'No registrations match your search criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}