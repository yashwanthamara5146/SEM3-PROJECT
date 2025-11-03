import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Calendar, MapPin, Check, X } from 'lucide-react';
import { TimeSlot } from '../types';

interface SchedulePickerProps {
  onScheduleSelect: (schedule: string) => void;
  initialSchedule?: string;
}

export function SchedulePicker({ onScheduleSelect, initialSchedule = "" }: SchedulePickerProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<"custom" | "preset">("preset");

  const daysOfWeek = [
    { code: 'M', name: 'Monday', short: 'Mon' },
    { code: 'T', name: 'Tuesday', short: 'Tue' },
    { code: 'W', name: 'Wednesday', short: 'Wed' },
    { code: 'R', name: 'Thursday', short: 'Thu' },
    { code: 'F', name: 'Friday', short: 'Fri' }
  ];

  const timeSlots = [
    "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "1:00", "1:30", "2:00", "2:30",
    "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30",
    "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00"
  ];

  const presetSchedules = [
    { label: "MWF 9:00-9:50 AM", value: "MWF 9:00-9:50 AM", days: ['M', 'W', 'F'], start: "9:00", end: "9:50", period: "AM" },
    { label: "MWF 10:00-10:50 AM", value: "MWF 10:00-10:50 AM", days: ['M', 'W', 'F'], start: "10:00", end: "10:50", period: "AM" },
    { label: "MWF 11:00-11:50 AM", value: "MWF 11:00-11:50 AM", days: ['M', 'W', 'F'], start: "11:00", end: "11:50", period: "AM" },
    { label: "TTh 9:00-10:15 AM", value: "TTh 9:00-10:15 AM", days: ['T', 'R'], start: "9:00", end: "10:15", period: "AM" },
    { label: "TTh 10:30-11:45 AM", value: "TTh 10:30-11:45 AM", days: ['T', 'R'], start: "10:30", end: "11:45", period: "AM" },
    { label: "TTh 2:00-3:15 PM", value: "TTh 2:00-3:15 PM", days: ['T', 'R'], start: "2:00", end: "3:15", period: "PM" },
    { label: "MW 1:00-2:15 PM", value: "MW 1:00-2:15 PM", days: ['M', 'W'], start: "1:00", end: "2:15", period: "PM" },
    { label: "MW 3:30-4:45 PM", value: "MW 3:30-4:45 PM", days: ['M', 'W'], start: "3:30", end: "4:45", period: "PM" }
  ];

  const toggleDay = (dayCode: string) => {
    setSelectedDays(prev => 
      prev.includes(dayCode) 
        ? prev.filter(d => d !== dayCode)
        : [...prev, dayCode].sort((a, b) => {
            const order = ['M', 'T', 'W', 'R', 'F'];
            return order.indexOf(a) - order.indexOf(b);
          })
    );
  };

  const formatTime = (time: string, period: "AM" | "PM") => {
    return `${time} ${period}`;
  };

  const generateScheduleString = () => {
    if (selectedPattern === "preset") return "";
    
    if (selectedDays.length === 0 || !startTime || !endTime) return "";
    
    // Handle special cases
    let dayPattern = selectedDays.join('');
    if (selectedDays.includes('T') && selectedDays.includes('R') && selectedDays.length === 2) {
      dayPattern = 'TTh';
    }
    
    // Determine AM/PM
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const startPeriod = startHour < 12 ? 'AM' : 'PM';
    const endPeriod = endHour < 12 ? 'AM' : 'PM';
    
    // Convert to 12-hour format
    const formatTimeFor12Hour = (time: string) => {
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);
      if (hour === 0) hour = 12;
      if (hour > 12) hour = hour - 12;
      return `${hour}:${minutes}`;
    };
    
    const formattedStart = formatTimeFor12Hour(startTime);
    const formattedEnd = formatTimeFor12Hour(endTime);
    
    // Assume same period for simplicity, or use the end period
    const period = endPeriod;
    
    return `${dayPattern} ${formattedStart}-${formattedEnd} ${period}`;
  };

  const handlePresetSelect = (preset: string) => {
    onScheduleSelect(preset);
  };

  const handleCustomSchedule = () => {
    const schedule = generateScheduleString();
    if (schedule) {
      onScheduleSelect(schedule);
    }
  };

  const isValidCustomSchedule = () => {
    return selectedDays.length > 0 && startTime && endTime && startTime < endTime;
  };

  // Visual schedule grid
  const renderScheduleGrid = () => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM
    
    return (
      <div className="mt-6">
        <h4 className="font-medium mb-3">Visual Schedule Preview</h4>
        <div className="grid grid-cols-6 gap-1 text-xs">
          <div className="p-2 font-medium text-center bg-muted rounded">Time</div>
          {daysOfWeek.map(day => (
            <div key={day.code} className="p-2 font-medium text-center bg-muted rounded">
              {day.short}
            </div>
          ))}
          
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className="p-2 text-center text-muted-foreground">
                {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
              </div>
              {daysOfWeek.map(day => {
                const isSelected = selectedDays.includes(day.code);
                const currentTime = `${hour.toString().padStart(2, '0')}:00`;
                const isInTimeRange = startTime && endTime && 
                  currentTime >= startTime && currentTime < endTime;
                
                return (
                  <div 
                    key={`${day.code}-${hour}`} 
                    className={`p-2 border rounded min-h-[32px] ${
                      isSelected && isInTimeRange 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-background border-border'
                    }`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Choose Schedule Type</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedPattern === "preset" ? "default" : "outline"}
              onClick={() => setSelectedPattern("preset")}
              className="justify-start"
            >
              <Clock className="h-4 w-4 mr-2" />
              Preset Schedules
            </Button>
            <Button
              variant={selectedPattern === "custom" ? "default" : "outline"}
              onClick={() => setSelectedPattern("custom")}
              className="justify-start"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Custom Schedule
            </Button>
          </div>
        </div>

        {selectedPattern === "preset" ? (
          /* Preset Schedules */
          <div className="space-y-3">
            <label className="text-sm font-medium">Popular Time Slots</label>
            <div className="grid gap-2">
              {presetSchedules.map(preset => (
                <Button
                  key={preset.value}
                  variant="outline"
                  onClick={() => handlePresetSelect(preset.value)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {preset.days.join(preset.days.includes('T') && preset.days.includes('R') && preset.days.length === 2 ? '' : '')}
                      </Badge>
                      <span>{preset.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">
                        {(() => {
                          const startHour = parseInt(preset.start.split(':')[0]);
                          const endHour = parseInt(preset.end.split(':')[0]);
                          const duration = endHour - startHour + (parseInt(preset.end.split(':')[1]) - parseInt(preset.start.split(':')[1])) / 60;
                          return `${duration}h`;
                        })()}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Schedule Builder */
          <div className="space-y-6">
            {/* Day Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Days</label>
              <div className="grid grid-cols-5 gap-2">
                {daysOfWeek.map(day => (
                  <Button
                    key={day.code}
                    variant={selectedDays.includes(day.code) ? "default" : "outline"}
                    onClick={() => toggleDay(day.code)}
                    className="aspect-square p-2"
                  >
                    <div className="text-center">
                      <div className="font-medium">{day.code}</div>
                      <div className="text-xs opacity-75">{day.short}</div>
                    </div>
                  </Button>
                ))}
              </div>
              {selectedDays.length > 0 && (
                <div className="mt-2 flex gap-1">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {selectedDays.map(day => {
                    const dayInfo = daysOfWeek.find(d => d.code === day);
                    return (
                      <Badge key={day} variant="secondary" className="text-xs">
                        {dayInfo?.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(0, 30).map(time => (
                      <SelectItem key={`start-${time}`} value={`${time.includes(':') ? time.split(':')[0].padStart(2, '0') : time.padStart(2, '0')}:${time.includes(':') ? time.split(':')[1] : '00'}`}>
                        {time} {parseInt(time.split(':')[0]) < 12 ? 'AM' : 'PM'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.slice(0, 30).map(time => (
                      <SelectItem key={`end-${time}`} value={`${time.includes(':') ? time.split(':')[0].padStart(2, '0') : time.padStart(2, '0')}:${time.includes(':') ? time.split(':')[1] : '00'}`}>
                        {time} {parseInt(time.split(':')[0]) < 12 ? 'AM' : 'PM'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generated Schedule Preview */}
            {isValidCustomSchedule() && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Generated Schedule:</p>
                    <p className="text-sm text-muted-foreground">{generateScheduleString()}</p>
                  </div>
                  <Button onClick={handleCustomSchedule} className="gap-2">
                    <Check className="h-4 w-4" />
                    Use This Schedule
                  </Button>
                </div>
              </div>
            )}

            {/* Visual Grid */}
            {selectedPattern === "custom" && renderScheduleGrid()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}