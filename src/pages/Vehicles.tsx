import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { Car, Radio, Plus, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import tollSystemAPI from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import VehicleRegistrationForm from "@/components/VehicleRegistrationForm";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeRFIDs: 0,
    passengerVehicles: 0,
    commercialVehicles: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    // Filter vehicles based on search term
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

  const loadVehicles = async () => {
    try {
      const vehiclesData = await tollSystemAPI.getAllVehicles();
      setVehicles(vehiclesData);

      // Calculate stats
      const totalVehicles = vehiclesData.length;
      const activeVehicles = vehiclesData.filter((v) => v.status === "active")
        .length;
      const passengerVehicles = vehiclesData.filter(
        (v) =>
          v.type?.toLowerCase().includes("passenger") ||
          v.type?.toLowerCase().includes("car")
      ).length;
      const commercialVehicles = vehiclesData.filter(
        (v) =>
          v.type?.toLowerCase().includes("commercial") ||
          v.type?.toLowerCase().includes("truck")
      ).length;

      setStats({
        totalVehicles,
        activeRFIDs: activeVehicles,
        passengerVehicles,
        commercialVehicles,
      });
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      toast({
        title: "Error",
        description: "Failed to load vehicle data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (vehicleId: string, newStatus: string) => {
    try {
      await tollSystemAPI.updateVehicleStatus(vehicleId, newStatus);
      toast({
        title: "Success",
        description: `Vehicle status updated to ${newStatus}`,
      });
      loadVehicles(); // Refresh data
    } catch (error) {
      console.error("Failed to update vehicle status:", error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading vehicle registry...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vehicle Registry</h1>
            <p className="text-muted-foreground">
              Manage RFID-enabled number plates and registrations
            </p>
          </div>
          <VehicleRegistrationForm />
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Registered"
            value={stats.totalVehicles.toLocaleString()}
            icon={Car}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Active RFIDs"
            value={stats.activeRFIDs.toLocaleString()}
            icon={Radio}
            description={`${stats.totalVehicles - stats.activeRFIDs} inactive`}
          />
          <StatCard
            title="Passenger Vehicles"
            value={stats.passengerVehicles.toLocaleString()}
            icon={Car}
            description={`${(
              (stats.passengerVehicles / stats.totalVehicles) *
              100
            ).toFixed(1)}% of total`}
          />
          <StatCard
            title="Commercial Fleet"
            value={stats.commercialVehicles.toLocaleString()}
            icon={Car}
            description={`${(
              (stats.commercialVehicles / stats.totalVehicles) *
              100
            ).toFixed(1)}% of total`}
          />
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>
                Registered Vehicles ({filteredVehicles.length})
              </CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by plate or RFID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>RFID Tag</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-semibold">
                      {vehicle.licensePlate}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {vehicle.rfid}
                    </TableCell>
                    <TableCell>{vehicle.ownerName || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehicle.type}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      ${parseFloat(vehicle.balance || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          vehicle.status === "active" ? "default" : "destructive"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {vehicle.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(vehicle.id, "suspended")}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(vehicle.id, "active")}
                          >
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(vehicle)}>
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      {searchTerm
                        ? "No vehicles found matching your search."
                        : "No vehicles registered."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Vehicle Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vehicle Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedVehicle?.licensePlate}
              </DialogDescription>
            </DialogHeader>
            
            {selectedVehicle && (
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                    <p className="text-lg font-semibold">{selectedVehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">RFID Tag</p>
                    <p className="text-lg font-mono">{selectedVehicle.rfid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Owner</p>
                    <p className="text-lg">{selectedVehicle.ownerName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle Type</p>
                    <Badge variant="outline" className="mt-1">{selectedVehicle.type}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Make & Model</p>
                    <p className="text-lg">{selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year</p>
                    <p className="text-lg">{selectedVehicle.year}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold text-success">
                      ${parseFloat(selectedVehicle.balance || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge
                      variant={selectedVehicle.status === "active" ? "default" : "destructive"}
                      className="mt-1"
                    >
                      {selectedVehicle.status}
                    </Badge>
                  </div>
                </div>

                {selectedVehicle.color && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Color</p>
                    <p className="text-lg">{selectedVehicle.color}</p>
                  </div>
                )}

                {selectedVehicle.registeredAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registered Date</p>
                    <p className="text-lg">
                      {new Date(selectedVehicle.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedVehicle.status === "active" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedVehicle.id, "suspended");
                        setDetailsOpen(false);
                      }}
                    >
                      Suspend Vehicle
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedVehicle.id, "active");
                        setDetailsOpen(false);
                      }}
                    >
                      Activate Vehicle
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Vehicles;
