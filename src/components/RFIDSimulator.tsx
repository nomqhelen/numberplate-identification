import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Radio, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TollStation {
  id: string;
  station_name: string;
  location: string;
}

const RFIDSimulator = () => {
  const { toast } = useToast();
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tollStations, setTollStations] = useState<TollStation[]>([]);

  useEffect(() => {
    const fetchTollStations = async () => {
      try {
        const { data, error } = await supabase
          .from('toll_stations')
          .select('*')
          .eq('status', 'active');

        if (error) throw error;
        setTollStations(data || []);
        if (data && data.length > 0) {
          setSelectedStation(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching toll stations:', error);
      }
    };

    fetchTollStations();
  }, []);

  const handleSimulation = async () => {
    if (!licensePlate || !selectedStation) {
      toast({
        title: "Error",
        description: "Please enter a license plate and select a toll station",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('rfid-simulation', {
        body: {
          licensePlate: licensePlate.toUpperCase(),
          tollStationId: selectedStation,
        },
      });

      if (error) throw error;

      setResult(data);

      if (data.success) {
        toast({
          title: "Transaction Successful",
          description: data.message,
        });
      } else {
        toast({
          title: "Transaction Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('RFID simulation error:', error);
      toast({
        title: "Simulation Error",
        description: error instanceof Error ? error.message : "Failed to simulate RFID read",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          RFID Reader Simulation
        </CardTitle>
        <CardDescription>
          Simulate vehicle detection and toll transaction processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="license-plate">License Plate</Label>
          <Input
            id="license-plate"
            placeholder="ABC-1234"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="toll-station">Toll Station</Label>
          <select
            id="toll-station"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            {tollStations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.station_name} - {station.location}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleSimulation} disabled={loading} className="w-full">
          {loading ? "Simulating..." : "Simulate RFID Read"}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">{result.message}</p>
                {result.transaction && (
                  <div className="text-sm space-y-1">
                    <p>Vehicle: {result.transaction.vehicle}</p>
                    <p>Toll Amount: ${result.transaction.tollAmount}</p>
                    <p>Previous Balance: ${result.transaction.previousBalance}</p>
                    <p>New Balance: ${result.transaction.newBalance}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
                {result.alert && (
                  <p className="text-sm font-medium">{result.alert}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RFIDSimulator;
