import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar, Clock, MapPin, AlertTriangle, Download, BookOpen } from 'lucide-react';
import { Course } from '../types';

interface ScheduleBuilderProps {
  courses: Course[];
  registeredCourses: number[];
}

interface ScheduleSlot {
  id: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  credits: number;
  duration: number; // in hours
}

export function ScheduleBuilder({ courses, registeredCourses }: ScheduleBuilderProps) {
  // Parse schedule strings and create schedule slots
  const scheduleSlots = useMemo(() => {
    const slots: ScheduleSlot[] = [];
    
    registeredCourses.forEach(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      // Parse schedule format like "MWF 9:00-9:50 AM" or "TTh 2:00-3:50 PM"
      const scheduleMatch = course.schedule.match(/([MTWRFSU]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s+(AM|PM)/);
      if (!scheduleMatch) return;
      
      const [, dayPattern, startTime, endTime, period] = scheduleMatch;
      
      // Convert day pattern to individual days
      const dayMap: { [key: string]: string } = {
        'M': 'Monday',
        'T': 'Tuesday', 
        'W': 'Wednesday',
        'R': 'Thursday',
        'F': 'Friday',
        'S': 'Saturday',
        'U': 'Sunday'
      };
      
      // Handle special cases like "TTh" (Tuesday/Thursday)
      let days: string[] = [];
      if (dayPattern === 'TTh') {
        days = ['Tuesday', 'Thursday'];
      } else {
        days = dayPattern.split('').map(d => dayMap[d]).filter(Boolean);
      }
      
      // Convert time to 24-hour format
      const convertTime = (time: string, period: string) => {
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
      };
      
      const start24 = convertTime(startTime, period);
      const end24 = convertTime(endTime, period);
      
      // Calculate duration
      const startMinutes = parseInt(start24.split(':')[0]) * 60 + parseInt(start24.split(':')[1]);
      const endMinutes = parseInt(end24.split(':')[0]) * 60 + parseInt(end24.split(':')[1]);
      const duration = (endMinutes - startMinutes) / 60;
      
      days.forEach(day => {
        slots.push({
          id: `${course.id}-${day}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          instructor: course.instructor,
          day,
          startTime: start24,
          endTime: end24,
          location: course.location,
          credits: course.credits,
          duration
        });
      });
    });
    
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [courses, registeredCourses]);

  // Detect schedule conflicts
  const conflicts = useMemo(() => {
    const conflictGroups: ScheduleSlot[][] = [];
    
    for (let i = 0; i < scheduleSlots.length; i++) {
      for (let j = i + 1; j < scheduleSlots.length; j++) {
        const slot1 = scheduleSlots[i];
        const slot2 = scheduleSlots[j];
        
        if (slot1.day === slot2.day && slot1.courseId !== slot2.courseId) {
          const start1 = slot1.startTime;
          const end1 = slot1.endTime;
          const start2 = slot2.startTime;
          const end2 = slot2.endTime;
          
          // Check for time overlap
          if ((start1 < end2 && end1 > start2)) {
            conflictGroups.push([slot1, slot2]);
          }
        }
      }
    }
    
    return conflictGroups;
  }, [scheduleSlots]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Generate time slots from 7 AM to 10 PM
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getSlotForTimeAndDay = (day: string, time: string) => {
    return scheduleSlots.find(slot => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
      const startMinutes = parseInt(slotStart.split(':')[0]) * 60 + parseInt(slotStart.split(':')[1]);
      const endMinutes = parseInt(slotEnd.split(':')[0]) * 60 + parseInt(slotEnd.split(':')[1]);
      
      return slot.day === day && timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const totalCredits = useMemo(() => {
    return registeredCourses.reduce((total, courseId) => {
      const course = courses.find(c => c.id === courseId);
      return total + (course?.credits || 0);
    }, 0);
  }, [courses, registeredCourses]);

  const totalHours = useMemo(() => {
    return scheduleSlots.reduce((total, slot) => {
      return total + slot.duration;
    }, 0);
  }, [scheduleSlots]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">My Schedule</h2>
          <p className="text-muted-foreground">View and manage your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{totalCredits}</p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Hours/Week</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <strong className="text-destructive">Schedule Conflicts Detected:</strong> You have {conflicts.length} time conflict(s) in your schedule.
            {conflicts.map((conflict, index) => (
              <div key={index} className="mt-2 text-sm">
                <strong>{conflict[0].courseCode}</strong> and <strong>{conflict[1].courseCode}</strong> both scheduled on {conflict[0].day} with overlapping times.
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Weekly Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-6 gap-1 min-w-[900px]">
              {/* Header */}
              <div className="p-3 font-medium text-center border-b bg-muted/50">Time</div>
              {daysOfWeek.map(day => (
                <div key={day} className="p-3 font-medium text-center border-b bg-muted/50">
                  {day}
                </div>
              ))}
              
              {/* Time slots */}
              {timeSlots.map(time => (
                <React.Fragment key={time}>
                  <div className="p-3 text-sm font-medium text-center border-r bg-muted/30 text-muted-foreground">
                    {formatTime(time)}
                  </div>
                  {daysOfWeek.map(day => {
                    const slot = getSlotForTimeAndDay(day, time);
                    const isConflicted = conflicts.some(conflict => 
                      conflict.some(c => c.id === slot?.id)
                    );
                    
                    return (
                      <div key={`${day}-${time}`} className="border-r border-b min-h-[70px] relative">
                        {slot && (
                          <div className={`absolute inset-1 p-2 rounded text-xs flex flex-col justify-between ${
                            isConflicted 
                              ? 'bg-red-100 border border-red-300 text-red-800' 
                              : 'bg-primary/10 border border-primary/20 text-primary'
                          }`}>
                            <div>
                              <div className="font-medium">{slot.courseCode}</div>
                              <div className="text-xs opacity-75">{slot.location}</div>
                            </div>
                            <div className="text-xs opacity-75">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enrolled Courses ({registeredCourses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registeredCourses.length > 0 ? (
              <div className="space-y-3">
                {registeredCourses.map(courseId => {
                  const course = courses.find(c => c.id === courseId);
                  if (!course) return null;
                  
                  const courseSlotsCount = scheduleSlots.filter(s => s.courseId === courseId).length;
                  
                  return (
                    <div key={courseId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{course.code}</h3>
                            <Badge variant="secondary">{course.credits} Credits</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{course.title}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{course.schedule}</span>
                          <span className="text-xs">({courseSlotsCount} sessions/week)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{course.location}</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span>Instructor: {course.instructor}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You haven't registered for any courses yet.</p>
                <Button variant="outline">
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{registeredCourses.length}</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{scheduleSlots.length}</div>
                <div className="text-sm text-muted-foreground">Class Sessions</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalCredits}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Hours/Week</div>
              </div>
            </div>
            
            {conflicts.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Attention:</strong> You have {conflicts.length} scheduling conflict(s) that need to be resolved.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium">Schedule Distribution</h4>
              {daysOfWeek.map(day => {
                const daySlots = scheduleSlots.filter(s => s.day === day);
                const dayHours = daySlots.reduce((sum, slot) => sum + slot.duration, 0);
                
                return (
                  <div key={day} className="flex justify-between items-center text-sm">
                    <span>{day}</span>
                    <span className="text-muted-foreground">
                      {daySlots.length} classes, {dayHours.toFixed(1)} hrs
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}