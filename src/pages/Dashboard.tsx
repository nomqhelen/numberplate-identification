import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, AlertTriangle, Activity } from "lucide-react";
import tollSystemAPI from "@/services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalRevenue: 0,
    activeAlerts: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Test Firebase connection first
      await tollSystemAPI.testConnection();
      
      // Get all vehicles from admin endpoint
      const vehicles = await tollSystemAPI.getAllVehicles();
      console.log('Dashboard vehicles:', vehicles);
      
      // Get all owners
      const owners = await tollSystemAPI.getAllOwners();
      console.log('Dashboard owners:', owners);
      
      // Calculate stats from Firebase data
      let totalVehicles = 0;
      let totalRevenue = 0;
      
      if (vehicles && typeof vehicles === 'object') {
        totalVehicles = Object.keys(vehicles).length;
        totalRevenue = Object.values(vehicles).reduce((sum: number, vehicle: any) => {
          return sum + Number(vehicle.balance || 0);
        }, 0);
      }
      
      setStats({
        totalVehicles,
        totalRevenue,
        activeAlerts: 2, // Mock data for now
        recentActivity: [
          {
            time: "2 minutes ago",
            type: "success",
            message: "Vehicle AAA-1234 passed Harare-Chitungwiza Toll Plaza"
          },
          {
            time: "5 minutes ago",
            type: "warning", 
            message: "Low balance detected for vehicle BBB-5678"
          },
          {
            time: "12 minutes ago",
            type: "success",
            message: "Toll payment processed: $5.00"
          },
          {
            time: "18 minutes ago",
            type: "alert",
            message: "RFID reader offline at Norton Plaza"
          },
          {
            time: "25 minutes ago",
            type: "success",
            message: "New vehicle registered: CCC-9101"
          }
        ]
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use fallback data if Firebase fails
      setStats({
        totalVehicles: 6,
        totalRevenue: 262.00,
        activeAlerts: 2,
        recentActivity: [
          {
            time: "2 minutes ago",
            type: "success",
            message: "Vehicle AAA-1234 passed Checkpoint B"
          },
          {
            time: "5 minutes ago",
            type: "warning",
            message: "Unregistered vehicle detected at Checkpoint A"
          },
          {
            time: "12 minutes ago",
            type: "success",
            message: "Toll payment processed: $15.00"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">System Dashboard</h1>
            <p className="text-muted-foreground">Loading Zimbabwe toll system data...</p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Electronic Number Plate (ENP) System</h1>
          <p className="text-muted-foreground">
            Real-time overview of Electronic Number Plate (ENP) System performance and statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Vehicles Registered"
            value={stats.totalVehicles.toLocaleString()}
            icon={Car}
            trend={{ value: 8.2, isPositive: true }}
            description="Active vehicles in system"
          />
          <StatCard
            title="Total Balance"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 5.3, isPositive: true }}
            description="Across all vehicles"
          />
          <StatCard
            title="System Alerts"
            value={stats.activeAlerts.toString()}
            icon={AlertTriangle}
            description="Hardware and system issues"
          />
        </div>

        {/* Recent Activity Section */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  time={activity.time}
                  type={activity.type as "success" | "warning" | "alert"}
                  message={activity.message}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ActivityItem = ({
  time,
  type,
  message,
}: {
  time: string;
  type: "success" | "warning" | "alert";
  message: string;
}) => {
  const colors = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-accent/10 text-accent border-accent/20",
    alert: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${colors[type]}`}>
      <div className={`mt-0.5 h-2 w-2 rounded-full ${colors[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs opacity-70">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;
