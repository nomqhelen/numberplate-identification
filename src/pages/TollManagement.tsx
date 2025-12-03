import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { DollarSign, TrendingUp, CreditCard, MapPin, Filter, Calendar } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import tollSystemAPI from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const TollManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [tollPlazaFilter, setTollPlazaFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, amount_high, amount_low

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeCheckpoints: 8,
    avgTransaction: 0
  });
  
  // Manual toll form state
  const [rfidInput, setRfidInput] = useState("");
  const [checkpointInput, setCheckpointInput] = useState("Harare-Chitungwiza Toll Plaza");
  const [processing, setProcessing] = useState(false);
  
  const { toast } = useToast();

  const tollPlazas = [
    "Harare-Chitungwiza Toll Plaza",
    "Norton Toll Plaza", 
    "Beatrice Toll Plaza",
    "Mukamuri Toll Plaza",
    "Bulawayo City Toll Plaza",
    "Gwanda Road Toll Plaza",
    "Plumtree Toll Plaza",
    "Victoria Falls Road Toll Plaza"
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, dateFilter, tollPlazaFilter, sortBy]);

  const loadData = async () => {
    try {
      console.log("🔄 Loading Zimbabwe toll management data...");

      // Load vehicles data
      const vehiclesData = await tollSystemAPI.getAllVehicles();
      console.log("🚗 Vehicles loaded:", vehiclesData?.length);
      setVehicles(vehiclesData || []);

      // Get all transactions
      let allTransactions = [];
      try {
        const ownerIds = ['owner1', 'owner2', 'owner3', 'owner4', 'owner5'];
        const transactionPromises = ownerIds.map(id => tollSystemAPI.getOwnerTolls(id));
        const ownerTransactions = await Promise.all(transactionPromises);
        allTransactions = ownerTransactions.flat();
        console.log("💳 All transactions loaded:", allTransactions.length);
      } catch (error) {
        console.warn("⚠️ Could not load all transactions, falling back to owner1");
        allTransactions = await tollSystemAPI.getOwnerTolls('owner1');
      }

      // Sort by newest first by default
      allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTransactions(allTransactions);

      // Load pricing rules
      const mockPricingRules = [
        { vehicleType: "Motorbike", basePrice: 0.00, description: "Free passage" },
        { vehicleType: "Small Car", basePrice: 5.00, description: "Standard cars" },
        { vehicleType: "Big Car", basePrice: 8.00, description: "Large SUVs, pickups" },
        { vehicleType: "Truck", basePrice: 10.00, description: "Cargo trucks" },
        { vehicleType: "Bus", basePrice: 12.00, description: "Buses, coaches" }
      ];
      setPricingRules(mockPricingRules);

      // Calculate statistics
      const totalRevenue = allTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
      const avgTransaction = allTransactions.length > 0 ? totalRevenue / allTransactions.length : 0;

      setStats({
        totalRevenue,
        totalTransactions: allTransactions.length,
        activeCheckpoints: 8,
        avgTransaction
      });

    } catch (error) {
      console.error(' Failed to load toll data:', error);
      toast({
        title: "Error",
        description: "Failed to load toll management data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        
        switch (dateFilter) {
          case "today":
            return txnDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return txnDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return txnDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply toll plaza filter
    if (tollPlazaFilter !== "all") {
      filtered = filtered.filter(txn => txn.checkpoint === tollPlazaFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "amount_high":
          return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
        case "amount_low":
          return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleManualToll = async (e) => {
    e.preventDefault();
    
    if (!rfidInput) {
      toast({
        title: "Error",
        description: "Please enter an RFID tag",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Find vehicle by RFID
      const vehicle = vehicles.find(v => v.rfid === rfidInput);
      
      if (!vehicle) {
        throw new Error(`Vehicle not found with RFID tag: ${rfidInput}`);
      }

      // Get pricing for vehicle type
      const pricingRule = pricingRules.find(rule => rule.vehicleType === vehicle.type);
      const tollAmount = pricingRule ? pricingRule.basePrice : 5.00;

      const result = await tollSystemAPI.processRFIDScan(
        rfidInput,
        checkpointInput,
        tollAmount
      );

      if (result.success) {
        toast({
          title: " Toll Processed Successfully",
          description: `${vehicle.type} ${vehicle.licensePlate} - ${tollAmount === 0 ? 'FREE' : `$${tollAmount.toFixed(2)}`} at ${checkpointInput}`,
        });
        
        setRfidInput("");
        loadData(); // Reload to show new transaction
      }
    } catch (error) {
      console.error(' Manual toll processing failed:', error);
      toast({
        title: "Toll Processing Failed",
        description: error.message || "Unable to process toll payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading Zimbabwe toll management data...</p>
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
          <h1 className="text-3xl font-bold">🇿🇼 Zimbabwe Toll Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage toll collection across Zimbabwe highways
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={{ value: 12.3, isPositive: true }}
            description="All toll collections"
          />
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions.toString()}
            icon={CreditCard}
            trend={{ value: 8.7, isPositive: true }}
            description="Across all plazas"
          />
          <StatCard
            title="Active Toll Plazas"
            value={stats.activeCheckpoints.toString()}
            icon={MapPin}
            description="Zimbabwe highways"
          />
          <StatCard
            title="Avg. Transaction"
            value={`$${stats.avgTransaction.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: 2.1, isPositive: false }}
          />
        </div>

        {/* Zimbabwe Toll Pricing Display */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle> Zimbabwe Toll Pricing Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {pricingRules.map((pricing, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <div className="font-semibold">{pricing.vehicleType}</div>
                    <div className="text-2xl font-bold text-green-600">
                      {pricing.basePrice === 0 ? 'FREE' : `$${pricing.basePrice.toFixed(2)}`}
                    </div>
                    <div className="text-xs text-muted-foreground">{pricing.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Manual Toll Processing */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle> Process Toll Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualToll} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rfid">RFID Tag</Label>
                  <Input
                    id="rfid"
                    placeholder="535D8E56"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="checkpoint">Zimbabwe Toll Plaza</Label>
                  <select
                    id="checkpoint"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={checkpointInput}
                    onChange={(e) => setCheckpointInput(e.target.value)}
                  >
                    <optgroup label="🏙️ HARARE REGION">
                      <option value="Harare-Chitungwiza Toll Plaza">Harare-Chitungwiza</option>
                      <option value="Norton Toll Plaza">Norton</option>
                      <option value="Beatrice Toll Plaza">Beatrice</option>
                      <option value="Mukamuri Toll Plaza">Mukamuri</option>
                    </optgroup>
                    <optgroup label="🏭 BULAWAYO REGION">
                      <option value="Bulawayo City Toll Plaza">Bulawayo City</option>
                      <option value="Gwanda Road Toll Plaza">Gwanda Road</option>
                      <option value="Plumtree Toll Plaza">Plumtree</option>
                      <option value="Victoria Falls Road Toll Plaza">Victoria Falls Road</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={processing} className="w-full">
                    {processing ? "Processing..." : "🏷️ Process Toll"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>📋 Toll Transactions ({filteredTransactions.length})</CardTitle>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Date Filter */}
                <div>
                  <Label className="text-xs">Time Period</Label>
                  <select
                    className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Toll Plaza Filter */}
                <div>
                  <Label className="text-xs">Toll Plaza</Label>
                  <select
                    className="w-40 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={tollPlazaFilter}
                    onChange={(e) => setTollPlazaFilter(e.target.value)}
                  >
                    <option value="all">All Plazas</option>
                    {tollPlazas.map(plaza => (
                      <option key={plaza} value={plaza}>{plaza}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <Label className="text-xs">Sort By</Label>
                  <select
                    className="w-32 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount_high">Amount High</option>
                    <option value="amount_low">Amount Low</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plaza</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 20).map((txn) => {
                  // Find the vehicle to get its type
                  const vehicle = vehicles.find(v => v.id === txn.vehicleId);
                  
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                      <TableCell className="font-semibold">{txn.licensePlate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{vehicle?.type || txn.vehicleType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {vehicle?.ownerName || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm">{txn.checkpoint}</TableCell>
                      <TableCell className="font-semibold">
                        {parseFloat(txn.amount || 0) === 0 ? 
                          <span className="text-blue-600 font-bold">FREE</span> : 
                          <span className="text-green-600">${parseFloat(txn.amount || 0).toFixed(2)}</span>
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(txn.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Success</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No transactions found with the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TollManagement;
