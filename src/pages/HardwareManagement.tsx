import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cpu, Radio, Plus, Settings, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";

const HardwareManagement = () => {
  const hardwareDevices = [
    {
      id: "ARD-001",
      name: "Arduino Uno - Gate 1",
      type: "Arduino Board",
      status: "Connected",
      location: "North Toll Plaza",
      ipAddress: "192.168.1.101",
      lastSync: "2 mins ago",
      sensors: 3,
    },
    {
      id: "ARD-002",
      name: "Arduino Mega - Gate 2",
      type: "Arduino Board",
      status: "Connected",
      location: "South Toll Plaza",
      ipAddress: "192.168.1.102",
      lastSync: "1 min ago",
      sensors: 5,
    },
    {
      id: "RFID-001",
      name: "RFID Reader Module 1",
      type: "RFID Reader",
      status: "Active",
      location: "North Toll Plaza - Lane 1",
      ipAddress: "192.168.1.201",
      lastSync: "3 mins ago",
      sensors: 1,
    },
    {
      id: "RFID-002",
      name: "RFID Reader Module 2",
      type: "RFID Reader",
      status: "Active",
      location: "North Toll Plaza - Lane 2",
      ipAddress: "192.168.1.202",
      lastSync: "2 mins ago",
      sensors: 1,
    },
    {
      id: "RFID-003",
      name: "RFID Reader Module 3",
      type: "RFID Reader",
      status: "Offline",
      location: "South Toll Plaza - Lane 1",
      ipAddress: "192.168.1.203",
      lastSync: "45 mins ago",
      sensors: 1,
    },
    {
      id: "ARD-003",
      name: "Arduino Nano - Barrier Control",
      type: "Arduino Board",
      status: "Connected",
      location: "South Toll Plaza",
      ipAddress: "192.168.1.103",
      lastSync: "5 mins ago",
      sensors: 2,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Connected":
      case "Active":
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      case "Offline":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Hardware Management
          </h1>
          <p className="text-muted-foreground">
            Configure and monitor Arduino boards, RFID readers, and sensor integrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Devices"
            value={hardwareDevices.length}
            icon={Cpu}
            description="Connected hardware"
          />
          <StatCard
            title="Arduino Boards"
            value={hardwareDevices.filter(d => d.type === "Arduino Board").length}
            icon={Cpu}
            description="Active controllers"
          />
          <StatCard
            title="RFID Readers"
            value={hardwareDevices.filter(d => d.type === "RFID Reader").length}
            icon={Radio}
            description="Tag scanners"
          />
          <StatCard
            title="Online Devices"
            value={hardwareDevices.filter(d => d.status !== "Offline").length}
            icon={Activity}
            description={`${hardwareDevices.filter(d => d.status === "Offline").length} offline`}
          />
        </div>

        {/* Hardware Table */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connected Hardware Devices</CardTitle>
              <CardDescription>Manage and configure your sensor network</CardDescription>
            </div>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hardwareDevices.map((device) => (
                  <TableRow key={device.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{device.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {device.type === "Arduino Board" ? (
                          <Cpu className="h-4 w-4 text-primary" />
                        ) : (
                          <Radio className="h-4 w-4 text-secondary" />
                        )}
                        {device.name}
                      </div>
                    </TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell className="text-muted-foreground">{device.location}</TableCell>
                    <TableCell className="font-mono text-sm">{device.ipAddress}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{device.lastSync}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HardwareManagement;
