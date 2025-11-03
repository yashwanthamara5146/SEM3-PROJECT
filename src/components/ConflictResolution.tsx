import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, Clock, Users, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Course, TimeSlot } from '../types';

interface Conflict {
  id: string;
  type: 'schedule' | 'capacity' | 'prerequisite';
  severity: 'high' | 'medium' | 'low';
  courses: Course[];
  students?: string[];
  details: string;
  timeSlot?: TimeSlot;
}

interface ConflictResolutionProps {
  courses: Course[];
  onUpdateCourse: (courseId: number, updates: any) => void;
}

export function ConflictResolution({ courses, onUpdateCourse }: ConflictResolutionProps) {
  // Parse schedule into time slots
  const parseSchedule = (schedule: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const scheduleMatch = schedule.match(/([MTWRFSU]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s+(AM|PM)/);
    
    if (!scheduleMatch) return slots;
    
    const [, dayPattern, startTime, endTime, period] = scheduleMatch;
    
    const dayMap: { [key: string]: string } = {
      'M': 'Monday',
      'T': 'Tuesday', 
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'U': 'Sunday'
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
    
    days.forEach(day => {
      slots.push({ day, startTime: start24, endTime: end24 });
    });
    
    return slots;
  };

  // Detect all conflicts
  const conflicts = useMemo(() => {
    const detectedConflicts: Conflict[] = [];
    
    // Schedule conflicts
    const activeCourses = courses.filter(c => c.status === 'active');
    for (let i = 0; i < activeCourses.length; i++) {
      for (let j = i + 1; j < activeCourses.length; j++) {
        const course1 = activeCourses[i];
        const course2 = activeCourses[j];
        
        const slots1 = parseSchedule(course1.schedule);
        const slots2 = parseSchedule(course2.schedule);
        
        slots1.forEach(slot1 => {
          slots2.forEach(slot2 => {
            if (slot1.day === slot2.day) {
              const overlap = (slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime);
              if (overlap) {
                detectedConflicts.push({
                  id: `schedule-${course1.id}-${course2.id}`,
                  type: 'schedule',
                  severity: 'high',
                  courses: [course1, course2],
                  details: `Time conflict on ${slot1.day}: ${course1.code} (${slot1.startTime}-${slot1.endTime}) overlaps with ${course2.code} (${slot2.startTime}-${slot2.endTime})`,
                  timeSlot: slot1
                });
              }
            }
          });
        });
      }
    }
    
    // Capacity warnings
    activeCourses.forEach(course => {
      const utilization = (course.enrolled / course.capacity) * 100;
      if (utilization >= 90) {
        detectedConflicts.push({
          id: `capacity-${course.id}`,
          type: 'capacity',
          severity: utilization >= 100 ? 'high' : 'medium',
          courses: [course],
          details: `${course.code} is at ${Math.round(utilization)}% capacity (${course.enrolled}/${course.capacity} students)`,
          students: [`${course.enrolled} students enrolled`]
        });
      }
    });
    
    // Location conflicts (same room, same time)
    for (let i = 0; i < activeCourses.length; i++) {
      for (let j = i + 1; j < activeCourses.length; j++) {
        const course1 = activeCourses[i];
        const course2 = activeCourses[j];
        
        if (course1.location === course2.location) {
          const slots1 = parseSchedule(course1.schedule);
          const slots2 = parseSchedule(course2.schedule);
          
          slots1.forEach(slot1 => {
            slots2.forEach(slot2 => {
              if (slot1.day === slot2.day) {
                const overlap = (slot1.startTime < slot2.endTime && slot1.endTime > slot2.startTime);
                if (overlap) {
                  detectedConflicts.push({
                    id: `location-${course1.id}-${course2.id}`,
                    type: 'schedule',
                    severity: 'high',
                    courses: [course1, course2],
                    details: `Room conflict at ${course1.location} on ${slot1.day}: ${course1.code} and ${course2.code} scheduled at overlapping times`
                  });
                }
              }
            });
          });
        }
      }
    }
    
    return detectedConflicts;
  }, [courses]);

  const getConflictIcon = (type: string, severity: string) => {
    if (severity === 'high') return <XCircle className="h-5 w-5 text-red-500" />;
    if (severity === 'medium') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <Clock className="h-5 w-5 text-blue-500" />;
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleResolveCapacity = (courseId: number, newCapacity: number) => {
    onUpdateCourse(courseId, { capacity: newCapacity });
  };

  const handleChangeSchedule = (courseId: number, newSchedule: string) => {
    onUpdateCourse(courseId, { schedule: newSchedule });
  };

  const handleChangeLocation = (courseId: number, newLocation: string) => {
    onUpdateCourse(courseId, { location: newLocation });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Conflict Resolution</h2>
          <p className="text-muted-foreground">Manage and resolve scheduling conflicts</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {conflicts.filter(c => c.severity === 'high').length} Critical
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {conflicts.filter(c => c.severity === 'medium').length} Warning
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {conflicts.filter(c => c.severity === 'low').length} Info
          </Badge>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Conflicts Detected</h3>
            <p className="text-muted-foreground">All courses are scheduled without conflicts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conflicts.map(conflict => (
            <Card key={conflict.id} className={getConflictColor(conflict.severity)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getConflictIcon(conflict.type, conflict.severity)}
                    <div>
                      <CardTitle className="text-base">
                        {conflict.type === 'schedule' ? 'Schedule Conflict' : 
                         conflict.type === 'capacity' ? 'Capacity Issue' : 'Prerequisite Problem'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {conflict.details}
                      </p>
                    </div>
                  </div>
                  <Badge variant={conflict.severity === 'high' ? 'destructive' : 'secondary'}>
                    {conflict.severity}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {conflict.courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{course.code}</span>
                          <span className="text-sm text-muted-foreground">{course.title}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.schedule}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {course.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolled}/{course.capacity}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {conflict.type === 'schedule' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reschedule {course.code}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">New Schedule</label>
                                  <Select onValueChange={(value) => handleChangeSchedule(course.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MWF 8:00-8:50 AM">MWF 8:00-8:50 AM</SelectItem>
                                      <SelectItem value="MWF 11:00-11:50 AM">MWF 11:00-11:50 AM</SelectItem>
                                      <SelectItem value="TTh 9:00-10:15 AM">TTh 9:00-10:15 AM</SelectItem>
                                      <SelectItem value="TTh 3:30-4:45 PM">TTh 3:30-4:45 PM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">New Location</label>
                                  <Select onValueChange={(value) => handleChangeLocation(course.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select new location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Computer Lab C">Computer Lab C</SelectItem>
                                      <SelectItem value="Engineering 301">Engineering 301</SelectItem>
                                      <SelectItem value="Science Building 201">Science Building 201</SelectItem>
                                      <SelectItem value="Library Room 150">Library Room 150</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {conflict.type === 'capacity' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Increase Capacity
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Increase Capacity for {course.code}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Current capacity: {course.capacity} students
                                </p>
                                <Select onValueChange={(value) => handleResolveCapacity(course.id, parseInt(value))}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select new capacity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={(course.capacity + 5).toString()}>
                                      {course.capacity + 5} students (+5)
                                    </SelectItem>
                                    <SelectItem value={(course.capacity + 10).toString()}>
                                      {course.capacity + 10} students (+10)
                                    </SelectItem>
                                    <SelectItem value={(course.capacity + 15).toString()}>
                                      {course.capacity + 15} students (+15)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start gap-2">
              <Clock className="h-4 w-4" />
              Auto-resolve Time Conflicts
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Users className="h-4 w-4" />
              Optimize Room Allocation
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <AlertTriangle className="h-4 w-4" />
              Generate Conflict Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}