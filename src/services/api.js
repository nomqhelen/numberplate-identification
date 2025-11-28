const API_BASE_URL = 'http://127.0.0.1:8001/api';

const tollSystemAPI = {
  // Test connection - use the correct endpoint
  testConnection: async () => {
    try {
      console.log('Testing connection to:', `${API_BASE_URL}/test-firebase/`);
      
      const response = await fetch(`${API_BASE_URL}/test-firebase/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));
      
      const text = await response.text();
      console.log('Raw response text (first 200 chars):', text.substring(0, 200));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('API test failed:', error);
      throw error;
    }
  },

  // Get all vehicles - use the correct admin endpoint
  getAllVehicles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vehicles/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Get vehicles failed:', error);
      throw error;
    }
  },

  // Process RFID scan - use the correct endpoint
  processRFIDScan: async (rfid, checkpoint, tollAmount) => {
    try {
      console.log('Processing RFID scan:', { rfid, checkpoint, tollAmount });
      
      const response = await fetch(`${API_BASE_URL}/toll/rfid-scan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfid,
          checkpoint,
          toll_amount: tollAmount,
        }),
      });

      console.log('RFID scan response status:', response.status);
      
      const text = await response.text();
      console.log('RFID scan raw response:', text.substring(0, 200));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('RFID scan failed:', error);
      throw error;
    }
  },

  // Get owner details - match the pattern owner/<str:owner_id>/
  getOwnerDetails: async (ownerId) => {
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get owner's vehicles - match the pattern owner/<str:owner_id>/vehicles/
  getOwnerVehicles: async (ownerId) => {
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/vehicles/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get owner's toll transactions - match the pattern owner/<str:owner_id>/tolls/
  getOwnerTolls: async (ownerId) => {
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/tolls/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get owner's payment transactions - match the pattern owner/<str:owner_id>/payments/
  getOwnerPayments: async (ownerId) => {
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/payments/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Recharge vehicle balance - match the pattern vehicle/<str:vehicle_id>/recharge/
  rechargeVehicle: async (vehicleId, amount) => {
    const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}/recharge/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to recharge vehicle');
    }
    
    return response.json();
  },

  // Update vehicle status - match the pattern admin/vehicle/<str:vehicle_id>/status/
  updateVehicleStatus: async (vehicleId, status) => {
    const response = await fetch(`${API_BASE_URL}/admin/vehicle/${vehicleId}/status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update vehicle status');
    }

    return response.json();
  },

  // Get all owners - match the pattern admin/owners/
  getAllOwners: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/owners/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Add new owner - match the pattern admin/add-owner/
  addOwner: async (ownerData) => {
    const response = await fetch(`${API_BASE_URL}/admin/add-owner/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ownerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add owner');
    }

    return response.json();
  },

  // Suspend vehicle (mark as missing) - use Django backend
  async suspendVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}/suspend/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to suspend vehicle');
      }
      
      return response.json();
    } catch (error) {
      console.error('Suspend vehicle error:', error);
      throw new Error('Failed to suspend vehicle');
    }
  },

  // Reactivate suspended vehicle - use Django backend
  async reactivateVehicle(vehicleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}/reactivate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reactivate vehicle');
      }
      
      return response.json();
    } catch (error) {
      console.error('Reactivate vehicle error:', error);
      throw new Error('Failed to reactivate vehicle');
    }
  },

  // Get suspended vehicles (for admin missing vehicles report)
  async getSuspendedVehicles() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/suspended-vehicles/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching suspended vehicles:', error);
      throw new Error('Failed to fetch suspended vehicles');
    }
  },

};

export default tollSystemAPI;