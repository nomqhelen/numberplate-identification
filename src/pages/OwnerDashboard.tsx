import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, DollarSign, History, CreditCard, AlertTriangle, Shield } from "lucide-react";
import StatCard from "@/components/StatCard";
import tollSystemAPI from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Vehicle {
  id: string;
  licensePlate: string;
  rfid: string;
  type: string;
  balance: number;
  status: string;
  make?: string;
  model?: string;
  year?: string;
}

interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
  checkpoint?: string;
  licensePlate: string;
  balanceAfter: number;
}

const OwnerDashboard = () => {
  const { toast } = useToast();
  const [ownerData, setOwnerData] = useState(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tollTransactions, setTollTransactions] = useState<Transaction[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [suspendingVehicle, setSuspendingVehicle] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access your dashboard.",
          variant: "destructive",
        });
        return;
      }

      // Get owner ID from Firebase user data or email mapping
      const firebaseUser = localStorage.getItem('firebaseUser');
      let currentOwnerId = 'owner1'; // default fallback

      if (firebaseUser) {
        const userData = JSON.parse(firebaseUser);
        currentOwnerId = userData.id;
      } else {
        // Map email to owner ID for existing users
        const emailToOwnerMap: { [key: string]: string } = {
          'john.smith@gmail.com': 'owner1',
          'rebecca.too@gmail.com': 'owner2',
          'charity.masiyiwa@gmail.com': 'owner3',
          'sarah.johnson@gmail.com': 'owner4',
          'lisa.moyo@gmail.com': 'owner5',
          'nomqhele.moyo@gmail.com': 'owner6'
        };
        
        currentOwnerId = emailToOwnerMap[session.user.email || ''] || 'owner1';
      }

      setOwnerId(currentOwnerId);
      await loadOwnerData(currentOwnerId);
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoading(false);
    }
  };

  const loadOwnerData = async (ownerIdToLoad: string) => {
    try {
      setLoading(true);
      
      // Load owner details and vehicles using your working API
      const [ownerDetails, ownerVehicles, ownerTolls, ownerPayments] = await Promise.all([
        tollSystemAPI.getOwnerDetails(ownerIdToLoad),
        tollSystemAPI.getOwnerVehicles(ownerIdToLoad),
        tollSystemAPI.getOwnerTolls(ownerIdToLoad),
        tollSystemAPI.getOwnerPayments(ownerIdToLoad)
      ]);

      console.log('Loaded data for owner:', ownerIdToLoad, { ownerDetails, ownerVehicles, ownerTolls, ownerPayments });

      setOwnerData(ownerDetails);
      
      // Convert vehicles object to array if needed
      if (ownerVehicles && typeof ownerVehicles === 'object') {
        const vehiclesArray = Object.entries(ownerVehicles).map(([id, vehicle]: [string, any]) => ({
          id,
          ...vehicle
        }));
        setVehicles(vehiclesArray);
      } else {
        setVehicles(ownerVehicles || []);
      }

      // Convert transactions to arrays if needed
      if (ownerTolls && typeof ownerTolls === 'object') {
        const tollsArray = Object.entries(ownerTolls).map(([id, toll]: [string, any]) => ({
          id,
          ...toll
        }));
        setTollTransactions(tollsArray);
      } else {
        setTollTransactions(ownerTolls || []);
      }

      if (ownerPayments && typeof ownerPayments === 'object') {
        const paymentsArray = Object.entries(ownerPayments).map(([id, payment]: [string, any]) => ({
          id,
          ...payment
        }));
        setPaymentTransactions(paymentsArray);
      } else {
        setPaymentTransactions(ownerPayments || []);
      }

    } catch (error) {
      console.error('Failed to load owner data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedVehicle || !paymentAmount) {
      toast({
        title: "Error",
        description: "Please select a vehicle and enter an amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);

    try {
      const result = await tollSystemAPI.rechargeVehicle(selectedVehicle, amount);
      
      toast({
        title: "Success",
        description: `Payment of $${amount} processed successfully!`,
      });
      
      setPaymentAmount("");
      setSelectedVehicle("");
      setSelectedVehicleDetails(null);
      
      // Reload data to get updated balances
      await loadOwnerData(ownerId);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSuspendVehicle = async (vehicleId: string, licensePlate: string) => {
    setSuspendingVehicle(vehicleId);

    try {
      // Call API to suspend vehicle
      const result = await tollSystemAPI.suspendVehicle(vehicleId);
      
      toast({
        title: "Vehicle Suspended",
        description: `${licensePlate} has been marked as suspended. It will now appear in admin reports as missing.`,
      });
      
      // Reload data to get updated status
      await loadOwnerData(ownerId);
    } catch (error: any) {
      console.error('Suspend error:', error);
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend vehicle",
        variant: "destructive",
      });
    } finally {
      setSuspendingVehicle("");
    }
  };

  const handleReactivateVehicle = async (vehicleId: string, licensePlate: string) => {
    setSuspendingVehicle(vehicleId);

    try {
      // Call API to reactivate vehicle
      const result = await tollSystemAPI.reactivateVehicle(vehicleId);
      
      toast({
        title: "Vehicle Reactivated",
        description: `${licensePlate} has been reactivated and is now active again.`,
      });
      
      // Reload data to get updated status
      await loadOwnerData(ownerId);
    } catch (error: any) {
      console.error('Reactivate error:', error);
      toast({
        title: "Reactivation Failed",
        description: error.message || "Failed to reactivate vehicle",
        variant: "destructive",
      });
    } finally {
      setSuspendingVehicle("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats from loaded data
  const totalBalance = vehicles.reduce((sum, v) => sum + Number(v.balance || 0), 0);
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const suspendedVehicles = vehicles.filter(v => v.status === 'suspended').length;
  const totalTollPaid = tollTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {ownerData?.name || 'Vehicle Owner'}
          </p>
          <p className="text-xs text-muted-foreground">Owner ID: {ownerId}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={`$${totalBalance.toFixed(2)}`}
            icon={DollarSign}
            description="Across all vehicles"
          />
          <StatCard
            title="Active Vehicles"
            value={activeVehicles.toString()}
            icon={Car}
            description={`${vehicles.length} total vehicles`}
          />
          <StatCard
            title="Suspended Vehicles"
            value={suspendedVehicles.toString()}
            icon={AlertTriangle}
            description="Reported as missing"
          />
          <StatCard
            title="Total Tolls Paid"
            value={`$${totalTollPaid.toFixed(2)}`}
            icon={History}
            description={`${tollTransactions.length} toll transactions`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* My Vehicles Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>My Vehicles</CardTitle>
              <CardDescription>Click on a vehicle to view details or manage status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>RFID Tag</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedVehicleDetails(vehicle)}
                    >
                      <TableCell className="font-semibold">{vehicle.licensePlate}</TableCell>
                      <TableCell className="text-muted-foreground">{vehicle.rfid}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell className="font-semibold text-success">
                        ${Number(vehicle.balance || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            vehicle.status === 'active' ? 'default' : 
                            vehicle.status === 'suspended' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {vehicle.status === 'active' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={suspendingVehicle === vehicle.id}
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                {suspendingVehicle === vehicle.id ? "..." : <><AlertTriangle className="w-3 h-3 mr-1" />Suspend</>}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend Vehicle</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to suspend {vehicle.licensePlate}? 
                                  This will mark it as missing in the system and it will appear in admin reports.
                                  The vehicle will not be able to pass through toll stations until reactivated.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleSuspendVehicle(vehicle.id, vehicle.licensePlate)}
                                >
                                  Suspend Vehicle
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : vehicle.status === 'suspended' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={suspendingVehicle === vehicle.id}
                            onClick={() => handleReactivateVehicle(vehicle.id, vehicle.licensePlate)}
                            className="text-success border-success hover:bg-success hover:text-success-foreground"
                          >
                            {suspendingVehicle === vehicle.id ? "..." : <><Shield className="w-3 h-3 mr-1" />Reactivate</>}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {vehicles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No vehicles registered yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Balance Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Add Balance
              </CardTitle>
              <CardDescription>Recharge your vehicle's toll balance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-select">Select Vehicle</Label>
                <select
                  id="vehicle-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  disabled={vehicles.length === 0}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles
                    .filter(vehicle => vehicle.status === 'active') // Only show active vehicles for recharge
                    .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - ${Number(vehicle.balance || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="50.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <Button
                onClick={handlePayment}
                disabled={processingPayment || vehicles.filter(v => v.status === 'active').length === 0}
                className="w-full"
              >
                {processingPayment ? "Processing..." : "Process Payment"}
              </Button>
              {vehicles.filter(v => v.status === 'active').length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  No active vehicles available for recharge
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Details Card */}
        {selectedVehicleDetails && (
          <Card className="shadow-card mb-6">
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
              <CardDescription>
                Detailed information about {selectedVehicleDetails.licensePlate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="text-lg font-semibold">{selectedVehicleDetails.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RFID Tag</p>
                  <p className="text-lg font-semibold">{selectedVehicleDetails.rfid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Type</p>
                  <p className="text-lg font-semibold">{selectedVehicleDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-semibold text-success">
                    ${Number(selectedVehicleDetails.balance || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant={
                      selectedVehicleDetails.status === 'active' ? 'default' : 
                      selectedVehicleDetails.status === 'suspended' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {selectedVehicleDetails.status}
                    {selectedVehicleDetails.status === 'suspended' && ' (Reported as Missing)'}
                  </Badge>
                </div>
                {selectedVehicleDetails.make && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Make</p>
                    <p className="text-lg font-semibold">
                      {selectedVehicleDetails.make} {selectedVehicleDetails.model}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Toll Transaction History</CardTitle>
              <CardDescription>Recent toll charges deducted from your vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Checkpoint</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tollTransactions.slice(0, 10).map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">
                        {new Date(txn.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{txn.licensePlate}</TableCell>
                      <TableCell className="text-sm">{txn.checkpoint || 'N/A'}</TableCell>
                      <TableCell className="font-semibold text-destructive">
                        -${Number(txn.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>${Number(txn.balanceAfter || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {tollTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No toll transactions yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recharge payments made to your vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTransactions.slice(0, 10).map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm">
                        {new Date(txn.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-success">
                        +${Number(txn.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>${Number(txn.balanceAfter || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {paymentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No payment history yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
