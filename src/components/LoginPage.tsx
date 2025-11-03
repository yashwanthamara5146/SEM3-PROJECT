import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { GraduationCap, Mail, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  pendingUsers: User[];
  onApproveUser: (userId: number) => void;
  onRejectUser: (userId: number) => void;
}

export function LoginPage({ onLogin, pendingUsers, onApproveUser, onRejectUser }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    year: "",
    major: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Mock users database
  const mockUsers: User[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@university.edu",
      role: "student",
      year: "Junior",
      major: "Computer Science",
      status: "approved"
    },
    {
      id: 2,
      name: "Admin User",
      email: "admin@university.edu",
      role: "admin",
      status: "approved"
    }
  ];

  const handleLogin = () => {
    setError("");
    
    // Check admin credentials
    if (email === "admin@university.edu" && password === "admin123") {
      onLogin({
        id: 2,
        name: "Admin User",
        email: "admin@university.edu",
        role: "admin",
        status: "approved"
      });
      return;
    }

    // Check student credentials
    const user = mockUsers.find(u => u.email === email && u.role === "student");
    if (user && password === "student123") {
      if (user.status === "approved") {
        onLogin(user);
      } else if (user.status === "pending") {
        setError("Your account is pending admin approval. Please contact the administrator.");
      } else {
        setError("Your account has been rejected. Please contact the administrator.");
      }
      return;
    }

    setError("Invalid email or password.");
  };

  const handleSignUp = () => {
    setError("");
    setSuccess("");
    
    if (!signUpData.name || !signUpData.email || !signUpData.password || !signUpData.year || !signUpData.major) {
      setError("Please fill in all fields.");
      return;
    }

    if (!signUpData.email.endsWith("@university.edu")) {
      setError("Please use your university email address.");
      return;
    }

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === signUpData.email);
    if (existingUser) {
      setError("An account with this email already exists.");
      return;
    }

    setSuccess("Account created successfully! Your account is pending admin approval. You will be notified once approved.");
    setSignUpData({ name: "", email: "", password: "", year: "", major: "" });
    setIsSignUp(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (showAdminPanel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>User Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Approve or reject student accounts</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowAdminPanel(false)}>
                Back to Login
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold">{pendingUsers.filter(u => u.status === "pending").length}</p>
                      <p className="text-sm text-muted-foreground">Pending Approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{pendingUsers.filter(u => u.status === "approved").length}</p>
                      <p className="text-sm text-muted-foreground">Approved Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold">{pendingUsers.filter(u => u.status === "rejected").length}</p>
                      <p className="text-sm text-muted-foreground">Rejected Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Requests</h3>
              
              {pendingUsers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending user requests</p>
                  </CardContent>
                </Card>
              ) : (
                pendingUsers.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge className={getStatusColor(user.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(user.status)}
                                {user.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <span>Email: {user.email}</span>
                            <span>Year: {user.year}</span>
                            <span>Major: {user.major}</span>
                            <span>Role: {user.role}</span>
                          </div>
                        </div>
                        
                        {user.status === "pending" && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => onApproveUser(user.id)}
                              className="gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => onRejectUser(user.id)}
                              className="gap-2"
                            >
                              <AlertCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl">Course Scheduler</CardTitle>
              <p className="text-sm text-muted-foreground">FEDF-PS48 Platform</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isSignUp ? (
            // Login Form
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleLogin} className="w-full">
                Sign In
              </Button>

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Credentials</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Admin:</p>
                    <p>admin@university.edu</p>
                    <p>admin123</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Student:</p>
                    <p>john.doe@university.edu</p>
                    <p>student123</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <Button variant="link" onClick={() => setIsSignUp(true)} className="text-sm">
                  New student? Create an account
                </Button>
                <Button variant="link" onClick={() => setShowAdminPanel(true)} className="text-sm">
                  Admin: Manage User Requests
                </Button>
              </div>
            </>
          ) : (
            // Sign Up Form
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">University Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@university.edu"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <Input
                      placeholder="Freshman"
                      value={signUpData.year}
                      onChange={(e) => setSignUpData({...signUpData, year: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Major</label>
                    <Input
                      placeholder="Computer Science"
                      value={signUpData.major}
                      onChange={(e) => setSignUpData({...signUpData, major: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="border-destructive bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSignUp} className="w-full">
                Create Account
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => setIsSignUp(false)} className="text-sm">
                  Already have an account? Sign in
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}