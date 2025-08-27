import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  User, 
  AlertTriangle, 
  FileText, 
  Upload, 
  LogOut,
  Settings,
  Bell,
  Activity
} from "lucide-react";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { ReportGrievanceTab } from "@/components/dashboard/ReportGrievanceTab";
import { ReportSuspiciousTab } from "@/components/dashboard/ReportSuspiciousTab";
import { MyReportsTab } from "@/components/dashboard/MyReportsTab";
import { useProfile } from "@/hooks/useProfile";
import { useReports } from "@/hooks/useReports";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useProfile();
  const { grievanceReports, suspiciousReports, loading: reportsLoading } = useReports();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  // Get user data from profile or use defaults
  const userData = {
    name: profile?.full_name || "User",
    email: profile?.email || user?.email || "",
    phone: profile?.phone || "",
    organization: profile?.organization || "",
    avatar: profile?.avatar_url || "",
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
    reportsSubmitted: grievanceReports.length + suspiciousReports.length,
    status: "Verified"
  };

  const allReports = [...grievanceReports, ...suspiciousReports];
  const pendingReports = [
    ...grievanceReports.filter(r => r.status === 'pending'),
    ...suspiciousReports.filter(r => r.status === 'reported')
  ].length;
  const resolvedReports = [
    ...grievanceReports.filter(r => r.status === 'resolved'),
    ...suspiciousReports.filter(r => r.status === 'verified')
  ].length;
  
  const stats = [
    {
      title: "Total Reports",
      value: allReports.length.toString(),
      description: "Reports submitted",
      icon: FileText,
      trend: reportsLoading ? "Loading..." : `${allReports.length} total`
    },
    {
      title: "Pending Review",
      value: pendingReports.toString(),
      description: "Awaiting analysis",
      icon: AlertTriangle,
      trend: pendingReports > 0 ? "Needs attention" : "All clear"
    },
    {
      title: "Resolved Cases",
      value: resolvedReports.toString(),
      description: "Successfully resolved",
      icon: Shield,
      trend: resolvedReports > 0 ? "Great work!" : "No resolved yet"
    },
    {
      title: "Security Score",
      value: "95%",
      description: "Account security",
      icon: Activity,
      trend: "Excellent"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">CyberSecure Dashboard</h1>
                <p className="text-sm text-muted-foreground">Security Management Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback>
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{userData.name}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'User'}!</h2>
              <p className="text-muted-foreground">
                Monitor your security reports and manage your account
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {userData.status}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <p className="text-xs text-primary mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="grievance" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Report Grievance
                </TabsTrigger>
                <TabsTrigger value="suspicious" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Report Suspicious
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  My Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileTab userData={userData} profile={profile} />
              </TabsContent>

              <TabsContent value="grievance">
                <ReportGrievanceTab />
              </TabsContent>

              <TabsContent value="suspicious">
                <ReportSuspiciousTab />
              </TabsContent>

              <TabsContent value="reports">
                <MyReportsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;