import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import tollSystemAPI from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const APITest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testAPI = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const testResponse = await tollSystemAPI.testConnection();
      console.log('Test connection:', testResponse);

      // Test getting vehicles
      const vehicles = await tollSystemAPI.getAllVehicles();
      console.log('Vehicles:', vehicles);

      setTestResult(`✅ API Connection Success!\nVehicles found: ${vehicles?.length || 0}`);
      
      toast({
        title: "Success",
        description: "API connection successful!",
      });
    } catch (error) {
      console.error('API test failed:', error);
      setTestResult(`❌ API Connection Failed: ${error.message}`);
      
      toast({
        title: "Error",
        description: `API test failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testRFIDScan = async () => {
    setLoading(true);
    try {
      const result = await tollSystemAPI.processRFIDScan('RFID001', 'Test Plaza', 5.00);
      console.log('RFID scan result:', result);
      
      setTestResult(`✅ RFID Scan Success!\nResult: ${JSON.stringify(result, null, 2)}`);
      
      toast({
        title: "Success",
        description: "RFID scan test successful!",
      });
    } catch (error) {
      console.error('RFID test failed:', error);
      setTestResult(`❌ RFID Scan Failed: ${error.message}`);
      
      toast({
        title: "Error",
        description: `RFID test failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>API Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testAPI} disabled={loading}>
                {loading ? 'Testing...' : 'Test API Connection'}
              </Button>
              <Button onClick={testRFIDScan} disabled={loading} variant="secondary">
                {loading ? 'Testing...' : 'Test RFID Scan'}
              </Button>
            </div>
            
            {testResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Django Backend:</strong> http://127.0.0.1:8001</p>
              <p><strong>API Endpoint:</strong> http://127.0.0.1:8001/api</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APITest;