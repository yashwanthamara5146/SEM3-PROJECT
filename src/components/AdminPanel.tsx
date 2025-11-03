import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SchedulePicker } from './SchedulePicker';
import { Plus, Edit, Trash2, Users, BookOpen, Clock, Calendar } from 'lucide-react';
import { Course } from '../types';

interface AdminPanelProps {
  courses: Course[];
  onAddCourse: (course: any) => void;
  onUpdateCourse: (courseId: number, course: any) => void;
  onDeleteCourse: (courseId: number) => void;
  onUpdateStatus: (courseId: number, status: string) => void;
}

export function AdminPanel({ courses, onAddCourse, onUpdateCourse, onDeleteCourse, onUpdateStatus }: AdminPanelProps) {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    credits: 3,
    instructor: "",
    schedule: "",
    location: "",
    capacity: 30,
    description: "",
    prerequisites: "",
    status: "draft",
    semester: "Fall 2024"
  });

  const handleAddCourse = () => {
    onAddCourse(newCourse);
    setNewCourse({
      code: "",
      title: "",
      credits: 3,
      instructor: "",
      schedule: "",
      location: "",
      capacity: 30,
      description: "",
      prerequisites: "",
      status: "draft",
      semester: "Fall 2024"
    });
    setIsAddingCourse(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Course Management</h2>
          <p className="text-muted-foreground">Manage course listings and schedules</p>
        </div>
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
                    placeholder="CS101"
                  />
                </div>
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
                      <SelectItem value="1">1 Credit</SelectItem>
                      <SelectItem value="2">2 Credits</SelectItem>
                      <SelectItem value="3">3 Credits</SelectItem>
                      <SelectItem value="4">4 Credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Course Title</label>
                <Input
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Introduction to Programming"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Instructor</label>
                  <Input
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Location</label>
                <Select value={newCourse.location} onValueChange={(value) => setNewCourse({...newCourse, location: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Lab A">Computer Lab A</SelectItem>
                    <SelectItem value="Computer Lab B">Computer Lab B</SelectItem>
                    <SelectItem value="Computer Lab C">Computer Lab C</SelectItem>
                    <SelectItem value="Engineering 205">Engineering 205</SelectItem>
                    <SelectItem value="Engineering 301">Engineering 301</SelectItem>
                    <SelectItem value="Math Building 101">Math Building 101</SelectItem>
                    <SelectItem value="Math Building 201">Math Building 201</SelectItem>
                    <SelectItem value="Science Building 150">Science Building 150</SelectItem>
                    <SelectItem value="Liberal Arts 310">Liberal Arts 310</SelectItem>
                    <SelectItem value="Library Room 150">Library Room 150</SelectItem>
                    <SelectItem value="Auditorium A">Auditorium A</SelectItem>
                    <SelectItem value="Auditorium B">Auditorium B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-3 block">Schedule</label>
                <SchedulePicker
                  onScheduleSelect={(schedule) => setNewCourse({...newCourse, schedule})}
                  initialSchedule={newCourse.schedule}
                />
                {newCourse.schedule && (
                  <div className="mt-2 p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Selected Schedule: </span>
                    <span className="text-sm">{newCourse.schedule}</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Prerequisites (comma-separated)</label>
                <Input
                  value={newCourse.prerequisites}
                  onChange={(e) => setNewCourse({...newCourse, prerequisites: e.target.value})}
                  placeholder="CS101, MATH101"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Course description..."
                  rows={3}
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, course) => sum + course.enrolled, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.length > 0 ? Math.round((courses.reduce((sum, course) => sum + course.enrolled, 0) / 
                  courses.reduce((sum, course) => sum + course.capacity, 0)) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{course.code}: {course.title}</h3>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                    <Badge variant="outline">{course.credits} Credits</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <span>Instructor: {course.instructor}</span>
                    <span>Schedule: {course.schedule}</span>
                    <span>Location: {course.location}</span>
                    <span>Enrolled: {course.enrolled}/{course.capacity}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={course.status}
                    onValueChange={(value) => onUpdateStatus(course.id, value)}
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
                    onClick={() => onDeleteCourse(course.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {courses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No courses available. Add your first course to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}