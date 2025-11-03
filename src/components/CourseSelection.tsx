import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ConflictNotification } from './ConflictNotification';
import { Search, Clock, Users, MapPin, Plus } from 'lucide-react';
import { Course } from '../types';

interface CourseSelectionProps {
  courses: Course[];
  registeredCourses: number[];
  onRegister: (courseId: number) => void;
  onUnregister: (courseId: number) => void;
  onShowConflict?: (conflicts: any[], attemptedCourse: Course) => void;
}

export function CourseSelection({ courses, registeredCourses, onRegister, onUnregister, onShowConflict }: CourseSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCredits, setSelectedCredits] = useState("all");
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictDetails, setConflictDetails] = useState<any>(null);

  const departments = ["all", "CS", "MATH", "ENG"];
  const creditOptions = ["all", "3", "4"];

  // Only show active courses to students
  const activeCourses = courses.filter(course => course.status === "active");

  const filteredCourses = activeCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "all" || 
                             course.code.startsWith(selectedDepartment);
    
    const matchesCredits = selectedCredits === "all" || 
                          course.credits.toString() === selectedCredits;

    return matchesSearch && matchesDepartment && matchesCredits;
  });

  const getAvailabilityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  // Enhanced conflict checking with detailed information
  const checkDetailedConflicts = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    const conflicts: any[] = [];

    // Check schedule conflicts
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

    const newSchedule = parseSchedule(course.schedule);
    
    // Check against registered courses
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
                conflictingCourse: registeredCourse,
                message: `This course conflicts with ${registeredCourse.code} on ${newSlot.day}`,
                suggestions: [
                  'Look for alternative time slots for this course',
                  'Consider taking this course in a different semester',
                  'Check if there are online or hybrid options available'
                ]
              });
            }
          }
        }
      }
    }

    // Check capacity
    if (course.enrolled >= course.capacity) {
      conflicts.push({
        type: 'capacity',
        conflictingCourse: course,
        message: `This course is at full capacity (${course.enrolled}/${course.capacity} students)`,
        suggestions: [
          'Join the waitlist if available',
          'Check for additional sections',
          'Consider alternative courses that fulfill the same requirements'
        ]
      });
    }

    // Check prerequisites (mock implementation)
    const hasUnmetPrerequisites = course.prerequisites.length > 0; // Simplified check
    if (hasUnmetPrerequisites) {
      conflicts.push({
        type: 'prerequisite',
        conflictingCourse: course,
        message: `You may not have completed all prerequisites: ${course.prerequisites.join(', ')}`,
        suggestions: [
          'Complete prerequisite courses first',
          'Contact your academic advisor for guidance',
          'Check if you can get prerequisite waiver'
        ]
      });
    }

    return conflicts.length > 0 ? { course, conflicts } : null;
  };

  const handleRegisterWithConflictCheck = (courseId: number) => {
    const conflictInfo = checkDetailedConflicts(courseId);
    
    if (conflictInfo) {
      setConflictDetails(conflictInfo);
      setShowConflictDialog(true);
    } else {
      onRegister(courseId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Course Catalog</h2>
        <p className="text-muted-foreground">Browse and register for available courses</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors, or course codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="CS">Computer Science</SelectItem>
                <SelectItem value="MATH">Mathematics</SelectItem>
                <SelectItem value="ENG">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCredits} onValueChange={setSelectedCredits}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Credits</SelectItem>
                <SelectItem value="3">3 Credits</SelectItem>
                <SelectItem value="4">4 Credits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="grid gap-4">
        {filteredCourses.map(course => {
          const isRegistered = registeredCourses.includes(course.id);
          const isFull = course.enrolled >= course.capacity;
          const canRegister = !isRegistered && !isFull;

          return (
            <Card key={course.id} className={isRegistered ? "border-primary bg-primary/5" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{course.code}: {course.title}</h3>
                      <Badge variant="secondary">{course.credits} Credits</Badge>
                      {isRegistered && <Badge>Registered</Badge>}
                      {isFull && <Badge variant="destructive">Full</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    {isRegistered ? (
                      <Button variant="outline" onClick={() => onUnregister(course.id)}>
                        Drop Course
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleRegisterWithConflictCheck(course.id)}
                        disabled={!canRegister}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {isFull ? "Waitlist" : "Register"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{course.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{course.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={getAvailabilityColor(course.enrolled, course.capacity)}>
                      {course.enrolled}/{course.capacity} students
                    </span>
                  </div>
                </div>

                {course.prerequisites.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Prerequisites: </span>
                    <span className="text-sm text-muted-foreground">
                      {course.prerequisites.join(", ")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedDepartment("all");
                setSelectedCredits("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conflict Notification Dialog */}
      {conflictDetails && (
        <ConflictNotification
          isOpen={showConflictDialog}
          onClose={() => {
            setShowConflictDialog(false);
            setConflictDetails(null);
          }}
          conflicts={conflictDetails.conflicts}
          attemptedCourse={conflictDetails.course}
          onViewAlternatives={() => {
            // Could filter courses to show alternatives
            setShowConflictDialog(false);
            setConflictDetails(null);
          }}
          onViewSchedule={() => {
            // Could switch to schedule tab
            setShowConflictDialog(false);
            setConflictDetails(null);
          }}
        />
      )}
    </div>
  );
}