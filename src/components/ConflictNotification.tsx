import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangle, Clock, MapPin, X, Info, Calendar } from 'lucide-react';
import { ConflictDetails, Course } from '../types';

interface ConflictNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictDetails[];
  attemptedCourse: Course;
  onViewAlternatives?: () => void;
  onViewSchedule?: () => void;
}

export function ConflictNotification({ 
  isOpen, 
  onClose, 
  conflicts, 
  attemptedCourse,
  onViewAlternatives,
  onViewSchedule 
}: ConflictNotificationProps) {
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Clock className="h-5 w-5 text-red-500" />;
      case 'capacity': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'prerequisite': return <Info className="h-5 w-5 text-blue-500" />;
      case 'location': return <MapPin className="h-5 w-5 text-orange-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case 'schedule': return 'border-red-200 bg-red-50';
      case 'capacity': return 'border-yellow-200 bg-yellow-50';
      case 'prerequisite': return 'border-blue-200 bg-blue-50';
      case 'location': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getConflictTitle = (type: string) => {
    switch (type) {
      case 'schedule': return 'Time Conflict';
      case 'capacity': return 'Course Full';
      case 'prerequisite': return 'Prerequisites Not Met';
      case 'location': return 'Room Conflict';
      default: return 'Conflict Detected';
    }
  };

  const formatScheduleTime = (schedule: string) => {
    // Parse schedule like "MWF 9:00-9:50 AM"
    const parts = schedule.split(' ');
    if (parts.length >= 3) {
      const days = parts[0];
      const time = parts.slice(1).join(' ');
      return { days, time };
    }
    return { days: schedule, time: '' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Registration Failed
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Attempted Course Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Attempted to Register:</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{attemptedCourse.code}</span>
                  <span className="text-sm text-muted-foreground">{attemptedCourse.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {attemptedCourse.schedule}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {attemptedCourse.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conflicts List */}
          <div className="space-y-4">
            <h4 className="font-medium">Registration Conflicts:</h4>
            
            {conflicts.map((conflict, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getConflictColor(conflict.type)}`}>
                <div className="flex items-start gap-3">
                  {getConflictIcon(conflict.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{getConflictTitle(conflict.type)}</h5>
                      <Badge variant="outline" className="text-xs">
                        {conflict.type}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-3">{conflict.message}</p>
                    
                    {conflict.type === 'schedule' && (
                      <div className="bg-white/50 p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Conflicting Course:</span>
                          <span className="text-sm font-medium">{conflict.conflictingCourse.code}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Your Course:</span>
                            <div className="mt-1">
                              <div>{attemptedCourse.code}: {formatScheduleTime(attemptedCourse.schedule).time}</div>
                              <div className="text-muted-foreground">{formatScheduleTime(attemptedCourse.schedule).days}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conflicts With:</span>
                            <div className="mt-1">
                              <div>{conflict.conflictingCourse.code}: {formatScheduleTime(conflict.conflictingCourse.schedule).time}</div>
                              <div className="text-muted-foreground">{formatScheduleTime(conflict.conflictingCourse.schedule).days}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {conflict.suggestions && conflict.suggestions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Suggestions:</p>
                        <ul className="text-sm space-y-1">
                          {conflict.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={onViewSchedule}
              className="flex-1 gap-2"
            >
              <Calendar className="h-4 w-4" />
              View My Schedule
            </Button>
            
            {onViewAlternatives && (
              <Button 
                onClick={onViewAlternatives}
                className="flex-1 gap-2"
              >
                <Info className="h-4 w-4" />
                Find Alternative Courses
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Help Text */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Need Help?</strong> Contact your academic advisor for assistance with course selection and scheduling conflicts. 
              You can also try registering for alternative time slots or waitlisting for full courses.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}