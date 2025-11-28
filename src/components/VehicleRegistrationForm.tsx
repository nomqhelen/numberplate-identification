import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface VehicleFormData {
  licensePlate: string;
  rfid: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  type: string;
  make: string;
  model: string;
  initialBalance: string;
}

const VehicleRegistrationForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<VehicleFormData>({
    licensePlate: '',
    rfid: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    type: '',
    make: '',
    model: '',
    initialBalance: '0.00'
  });

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      rfid: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      type: '',
      make: '',
      model: '',
      initialBalance: '0.00'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.licensePlate || !formData.rfid || !formData.ownerName || !formData.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields (License Plate, RFID, Owner Name, and Vehicle Type)."
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Show processing notification
      toast({
        title: "Processing Registration",
        description: "Vehicle registration is being processed...",
        duration: 2000,
      });

      // Simulate API call delay (remove this when connecting to backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success notification
      toast({
        title: "Vehicle Registered Successfully!",
        description: `${formData.licensePlate} has been added to the system.`,
        duration: 4000,
      });

      // Reset form and close modal
      resetForm();
      setIsOpen(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error registering the vehicle. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Register Vehicle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Register New Vehicle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vehicle Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  placeholder="e.g., ABC-1234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfid">RFID Tag *</Label>
                <Input
                  id="rfid"
                  value={formData.rfid}
                  onChange={(e) => handleInputChange('rfid', e.target.value)}
                  placeholder="e.g., RFID001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Vehicle Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car/Passenger Vehicle</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Truck">Truck/Commercial</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialBalance">Initial Balance (KES)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.initialBalance}
                  onChange={(e) => handleInputChange('initialBalance', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="e.g., Toyota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Corolla"
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Owner Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="e.g., john@example.com"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="ownerPhone">Owner Phone</Label>
                <Input
                  id="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  placeholder="e.g., +254712345678"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleRegistrationForm;