// Firebase Database Seeder for Zimbabwe Toll System
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./backend/toll/toll_system/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://toll-system-9b01a-default-rtdb.firebaseio.com/'
});

const db = admin.database();

// Zimbabwe Toll System Data
const seedData = {

  owners: {
    "owner1": {
      name: "John Smith",
      email: "john.smith@gmail.com",
      password: "owner123", // Add password for login
      phone: "+263712345678",
      nationalId: "63-123456-A47",
      address: "123 Borrowdale Road, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-01-15T10:00:00Z"
    },
    "owner2": {
      name: "Rebecca Too", 
      email: "rebecca.too@gmail.com",
      password: "owner123", // Add password for login
      phone: "+263723456789",
      nationalId: "63-234567-B58",
      address: "45 Fife Avenue, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-01-20T14:30:00Z"
    },
    "owner3": {
      name: "Charity Masiyiwa",
      email: "charity.masiyiwa@gmail.com",
      password: "owner123", // Add password for login
      phone: "+263734567890", 
      nationalId: "63-345678-C69",
      address: "78 Highlands, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-02-01T09:15:00Z"
    },
    "owner4": {
      name: "Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      password: "owner123", // Add password for login
      phone: "+263745678901",
      nationalId: "63-456789-D70",
      address: "12 Avondale, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-02-10T11:20:00Z"
    },
    "owner5": {
      name: "Lisa Moyo",
      email: "lisa.moyo@gmail.com", 
      password: "owner123", // Add password for login
      phone: "+263756789012",
      nationalId: "63-567890-E81",
      address: "34 Mount Pleasant, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-02-15T16:45:00Z"
    },
    // 🆕 NEW OWNER: Nomqhele Moyo
    "owner6": {
      name: "Nomqhele Moyo",
      email: "nomqhele.moyo@gmail.com",
      password: "owner123", // Add password for login
      phone: "+263767890123",
      nationalId: "63-678901-F92",
      address: "89 Greystone Park, Harare",
      role: "owner", // Add role for authentication
      createdAt: "2024-02-20T13:30:00Z"
    }
  },

  // System Administrators with login credentials
  admins: {
    "admin1": {
      name: "System Administrator",
      email: "admin@toll.gov.zw",
      password: "admin123", // Add admin password
      role: "admin", // Admin role
      phone: "+263713000001",
      employeeId: "ZINARA001",
      department: "Toll Operations",
      createdAt: "2024-01-01T08:00:00Z"
    },
    "admin2": {
      name: "Tinevimbo Nyoni",
      email: "tinevimbo.nyoni@zinara.co.zw",
      password: "admin123", // Add admin password
      role: "admin", // Admin role
      phone: "+263713000002",
      employeeId: "ZINARA002",
      department: "Revenue Management",
      createdAt: "2024-01-01T08:00:00Z"
    }
  },
  
  // Vehicle Fleet with Zimbabwe Plates
  vehicles: {
    "vehicle1": {
      licensePlate: "ABH-2411",
      rfid: "535D8E56",
      type: "Small Car",
      ownerId: "owner1",
      ownerName: "John Smith",
      balance: 50.00,
      status: "active",
      make: "Toyota",
      model: "Vitz",
      year: "2018",
      createdAt: "2024-01-15T10:30:00Z"
    },
    "vehicle2": {
      licensePlate: "BBB-5678", 
      rfid: "RFID002",
      type: "Small Car",
      ownerId: "owner1",
      ownerName: "John Smith",
      balance: 25.00,
      status: "active",
      make: "Honda",
      model: "Fit",
      year: "2019",
      createdAt: "2024-01-16T11:00:00Z"
    },
    "vehicle3": {
      licensePlate: "XYZ-5678",
      rfid: "E33BFA05", 
      type: "Motorbike",
      ownerId: "owner2",
      ownerName: "Rebecca Too",
      balance: 15.00,
      status: "active",
      make: "Yamaha",
      model: "FZ16",
      year: "2020",
      createdAt: "2024-01-20T15:00:00Z"
    },
    "vehicle4": {
      licensePlate: "DDD-1121",
      rfid: "RFID004",
      type: "Truck", 
      ownerId: "owner3",
      ownerName: "Charity Masiyiwa",
      balance: 80.00,
      status: "active",
      make: "Isuzu",
      model: "NPR 400",
      year: "2017",
      createdAt: "2024-02-01T10:00:00Z"
    },
    "vehicle5": {
      licensePlate: "EEE-3141",
      rfid: "RFID005",
      type: "Big Car",
      ownerId: "owner4",
      ownerName: "Sarah Johnson",
      balance: 32.00,
      status: "active",
      make: "Toyota",
      model: "Land Cruiser",
      year: "2019",
      createdAt: "2024-02-05T12:30:00Z"
    },
    "vehicle6": {
      licensePlate: "FFF-7890",
      rfid: "RFID006",
      type: "Bus",
      ownerId: "owner5",
      ownerName: "Lisa Moyo",
      balance: 60.00,
      status: "active", 
      make: "Scania",
      model: "Citywide",
      year: "2016",
      createdAt: "2024-02-10T14:20:00Z"
    },
   
    "vehicle7": {
      licensePlate: "NMQ-2024",
      rfid: "RFID007",
      type: "Big Car",
      ownerId: "owner6",
      ownerName: "Nomqhele Moyo",
      balance: 75.00,
      status: "active",
      make: "BMW",
      model: "X5",
      year: "2021",
      createdAt: "2024-02-20T14:00:00Z"
    },
  
    "vehicle8": {
      licensePlate: "NMQ-7777",
      rfid: "RFID008",
      type: "Truck",
      ownerId: "owner6",
      ownerName: "Nomqhele Moyo",
      balance: 120.00,
      status: "active",
      make: "Mercedes-Benz",
      model: "Actros",
      year: "2020",
      createdAt: "2024-02-20T14:30:00Z"
    }
  },

  // Zimbabwe Toll Plazas
  tollPlazas: {
    "plaza1": {
      name: "Harare-Chitungwiza Toll Plaza",
      location: "Seke Road, 15km from Harare",
      province: "Harare",
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 4,
      coordinates: "-17.8178, 31.0447",
      createdAt: "2020-06-01T00:00:00Z"
    },
    "plaza2": {
      name: "Norton Toll Plaza", 
      location: "Harare-Bulawayo Highway, Norton",
      province: "Mashonaland West",
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 3,
      coordinates: "-17.8833, 30.7000",
      createdAt: "2019-03-15T00:00:00Z"
    },
    "plaza3": {
      name: "Beatrice Toll Plaza",
      location: "Harare-Masvingo Highway, Beatrice",
      province: "Mashonaland East", 
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 3,
      coordinates: "-18.2167, 31.0167",
      createdAt: "2018-08-20T00:00:00Z"
    },
    "plaza4": {
      name: "Mukamuri Toll Plaza",
      location: "Harare-Mutare Highway, Mukamuri",
      province: "Mashonaland East",
      isActive: true,
      operatingHours: "24/7", 
      totalLanes: 2,
      coordinates: "-18.0833, 31.5833",
      createdAt: "2017-11-10T00:00:00Z"
    },
    
    "plaza5": {
      name: "Bulawayo City Toll Plaza",
      location: "Joshua Mqabuko Nkomo Road, Bulawayo Entry",
      province: "Bulawayo",
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 3,
      coordinates: "-20.1500, 28.5833",
      createdAt: "2021-01-15T00:00:00Z"
    },
    "plaza6": {
      name: "Gwanda Road Toll Plaza", 
      location: "Bulawayo-Beitbridge Highway, Gwanda Road",
      province: "Bulawayo",
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 2,
      coordinates: "-20.2167, 28.6167",
      createdAt: "2020-08-10T00:00:00Z"
    },
    "plaza7": {
      name: "Plumtree Toll Plaza",
      location: "Bulawayo-Plumtree Highway, Near Plumtree",
      province: "Matabeleland South",
      isActive: true,
      operatingHours: "06:00-22:00",
      totalLanes: 2,
      coordinates: "-20.4833, 27.8167",
      createdAt: "2019-11-25T00:00:00Z"
    },
    "plaza8": {
      name: "Victoria Falls Road Toll Plaza",
      location: "Bulawayo-Victoria Falls Highway, Hwange District",
      province: "Matabeleland North",
      isActive: true,
      operatingHours: "24/7",
      totalLanes: 3,
      coordinates: "-19.5167, 27.2500",
      createdAt: "2022-03-20T00:00:00Z"
    }
  },

  // Zimbabwe Toll Pricing Rules
  pricingRules: {
    "rule1": {
      vehicleType: "Motorbike",
      basePrice: 0.00,  // FREE for motorbikes
      currency: "USD",
      description: "Motorcycles and scooters - Free passage",
      isActive: true
    },
    "rule2": {
      vehicleType: "Small Car",
      basePrice: 5.00,  // $5 for small cars
      currency: "USD", 
      description: "Sedans, hatchbacks, small SUVs",
      isActive: true
    },
    "rule3": {
      vehicleType: "Big Car",
      basePrice: 8.00,  // $8 for big cars
      currency: "USD",
      description: "Large SUVs, pickups, luxury vehicles",
      isActive: true
    },
    "rule4": {
      vehicleType: "Truck",
      basePrice: 10.00,  // $10 for trucks
      currency: "USD", 
      description: "Cargo trucks, delivery vehicles",
      isActive: true
    },
    "rule5": {
      vehicleType: "Bus",
      basePrice: 12.00,  // $12 for buses
      currency: "USD",
      description: "Buses, coaches, large transport vehicles",
      isActive: true
    }
  },

  // RFID Hardware at Zimbabwe Toll Plazas
  hardwareEndpoints: {
   
    "reader1": {
      tollPlazaId: "plaza1",
      endpointId: "ESP32_HRE_001",
      deviceName: "Lane 1 Reader - Harare-Chitungwiza",
      isOnline: true,
      lastHeartbeat: "2024-11-15T08:00:00Z",
      ipAddress: "192.168.1.101",
      lane: 1,
      location: "Harare-Chitungwiza Plaza"
    },
    "reader2": {
      tollPlazaId: "plaza2",
      endpointId: "ESP32_NTN_002",
      deviceName: "Lane 1 Reader - Norton Plaza", 
      isOnline: true,
      lastHeartbeat: "2024-11-15T08:00:00Z", 
      ipAddress: "192.168.1.102",
      lane: 1,
      location: "Norton Plaza"
    },
    "reader3": {
      tollPlazaId: "plaza3",
      endpointId: "ESP32_BTC_003",
      deviceName: "Lane 1 Reader - Beatrice Plaza",
      isOnline: true,
      lastHeartbeat: "2024-11-15T07:45:00Z",
      ipAddress: "192.168.1.103", 
      lane: 1,
      location: "Beatrice Plaza"
    },
    "reader4": {
      tollPlazaId: "plaza4",
      endpointId: "ESP32_MKM_004",
      deviceName: "Lane 1 Reader - Mukamuri Plaza",
      isOnline: false,
      lastHeartbeat: "2024-11-14T22:30:00Z",
      ipAddress: "192.168.1.104",
      lane: 1,
      location: "Mukamuri Plaza"
    },
    
    "reader5": {
      tollPlazaId: "plaza5",
      endpointId: "ESP32_BWY_005",
      deviceName: "Lane 1 Reader - Bulawayo City",
      isOnline: true,
      lastHeartbeat: "2024-11-15T08:15:00Z",
      ipAddress: "192.168.2.101",
      lane: 1,
      location: "Bulawayo City Plaza"
    },
    "reader6": {
      tollPlazaId: "plaza6", 
      endpointId: "ESP32_GWD_006",
      deviceName: "Lane 1 Reader - Gwanda Road",
      isOnline: true,
      lastHeartbeat: "2024-11-15T08:10:00Z",
      ipAddress: "192.168.2.102",
      lane: 1,
      location: "Gwanda Road Plaza"
    },
    "reader7": {
      tollPlazaId: "plaza7",
      endpointId: "ESP32_PLT_007", 
      deviceName: "Lane 1 Reader - Plumtree",
      isOnline: false,
      lastHeartbeat: "2024-11-14T21:45:00Z",
      ipAddress: "192.168.2.103",
      lane: 1,
      location: "Plumtree Plaza"
    },
    "reader8": {
      tollPlazaId: "plaza8",
      endpointId: "ESP32_VFC_008",
      deviceName: "Lane 1 Reader - Victoria Falls Road",
      isOnline: true,
      lastHeartbeat: "2024-11-15T08:05:00Z", 
      ipAddress: "192.168.2.104",
      lane: 1,
      location: "Victoria Falls Road Plaza"
    }
  },

  // Hardware Management Section (for the Hardware page)
  hardware: {
    "ARD-001": {
      name: "Arduino Uno - Gate 1",
      type: "Arduino Board",
      status: "Connected",
      location: "Harare-Chitungwiza Toll Plaza",
      ipAddress: "192.168.1.101",
      lastSync: "2 mins ago",
      sensors: 3,
      serialNumber: "ARD-SN-001",
      firmware: "v2.1.0",
      installedAt: "2024-01-15T08:00:00Z",
      tollPlazaId: "plaza1"
    },
    "ARD-002": {
      name: "Arduino Mega - Gate 2",
      type: "Arduino Board",
      status: "Connected",
      location: "Norton Toll Plaza",
      ipAddress: "192.168.1.102",
      lastSync: "1 min ago",
      sensors: 5,
      serialNumber: "ARD-SN-002",
      firmware: "v2.1.0",
      installedAt: "2024-01-16T10:30:00Z",
      tollPlazaId: "plaza2"
    },
    "RFID-001": {
      name: "RFID Reader Module 1",
      type: "RFID Reader",
      status: "Active",
      location: "Harare-Chitungwiza Plaza - Lane 1",
      ipAddress: "192.168.1.201",
      lastSync: "3 mins ago",
      sensors: 1,
      serialNumber: "RFID-SN-001",
      firmware: "v1.5.2",
      installedAt: "2024-01-17T14:15:00Z",
      tollPlazaId: "plaza1"
    },
    "RFID-002": {
      name: "RFID Reader Module 2",
      type: "RFID Reader",
      status: "Active",
      location: "Norton Plaza - Lane 1",
      ipAddress: "192.168.1.202",
      lastSync: "2 mins ago",
      sensors: 1,
      serialNumber: "RFID-SN-002",
      firmware: "v1.5.2",
      installedAt: "2024-01-18T09:45:00Z",
      tollPlazaId: "plaza2"
    },
    "RFID-003": {
      name: "RFID Reader Module 3",
      type: "RFID Reader",
      status: "Offline",
      location: "Beatrice Plaza - Lane 1",
      ipAddress: "192.168.1.203",
      lastSync: "45 mins ago",
      sensors: 1,
      serialNumber: "RFID-SN-003",
      firmware: "v1.4.1",
      installedAt: "2024-01-19T16:20:00Z",
      tollPlazaId: "plaza3"
    },
    "ARD-003": {
      name: "Arduino Nano - Barrier Control",
      type: "Arduino Board",
      status: "Connected",
      location: "Mukamuri Plaza",
      ipAddress: "192.168.1.103",
      lastSync: "5 mins ago",
      sensors: 2,
      serialNumber: "ARD-SN-003",
      firmware: "v2.0.5",
      installedAt: "2024-01-20T11:10:00Z",
      tollPlazaId: "plaza4"
    },
    "RFID-004": {
      name: "RFID Reader Module 4",
      type: "RFID Reader", 
      status: "Active",
      location: "Bulawayo City Plaza - Lane 1",
      ipAddress: "192.168.2.101",
      lastSync: "1 min ago",
      sensors: 1,
      serialNumber: "RFID-SN-004",
      firmware: "v1.6.0",
      installedAt: "2024-02-01T12:00:00Z",
      tollPlazaId: "plaza5"
    },
    "RFID-005": {
      name: "RFID Reader Module 5",
      type: "RFID Reader",
      status: "Active", 
      location: "Victoria Falls Road Plaza - Lane 1",
      ipAddress: "192.168.2.104",
      lastSync: "4 mins ago",
      sensors: 1,
      serialNumber: "RFID-SN-005",
      firmware: "v1.6.0",
      installedAt: "2024-02-15T16:30:00Z",
      tollPlazaId: "plaza8"
    }
  },

  // Recent toll transactions with Zimbabwe pricing
  transactions: {
    "trans1": {
      vehicleId: "vehicle1",
      ownerId: "owner1",
      rfid: "535D8E56",  // ✅ FIXED - Match vehicle1
      vehicleType: "Small Car",
      amount: 5.00,
      balanceAfter: 45.00,
      tollPlazaId: "plaza1",
      checkpoint: "Harare-Chitungwiza Toll Plaza",
      timestamp: "2024-11-14T08:30:00Z",
      licensePlate: "ABH-2411",  // ✅ FIXED - Match vehicle1
      readerId: "reader1"
    },
    "trans2": {
      vehicleId: "vehicle3",
      ownerId: "owner2",
      rfid: "E33BFA05",  // ✅ FIXED - Match vehicle3
      vehicleType: "Motorbike",
      amount: 0.00,
      balanceAfter: 15.00,
      tollPlazaId: "plaza2",
      checkpoint: "Norton Toll Plaza", 
      timestamp: "2024-11-14T14:15:00Z",
      licensePlate: "XYZ-5678",  // ✅ FIXED - Match vehicle3
      readerId: "reader2"
    },
    "trans3": {
      vehicleId: "vehicle4",
      ownerId: "owner3",
      rfid: "RFID004",
      vehicleType: "Truck", 
      amount: 10.00,
      balanceAfter: 70.00,
      tollPlazaId: "plaza3", 
      checkpoint: "Beatrice Toll Plaza",
      timestamp: "2024-11-14T16:45:00Z",
      licensePlate: "DDD-1121",
      readerId: "reader3"
    },
    "trans4": {
      vehicleId: "vehicle5",
      ownerId: "owner4",
      rfid: "RFID005",
      vehicleType: "Big Car",
      amount: 8.00,  // Big car rate
      balanceAfter: 24.00,
      tollPlazaId: "plaza1",
      checkpoint: "Harare-Chitungwiza Toll Plaza",
      timestamp: "2024-11-14T18:20:00Z",
      licensePlate: "EEE-3141", 
      readerId: "reader1"
    },
    "trans5": {
      vehicleId: "vehicle6",
      ownerId: "owner5",
      rfid: "RFID006",
      vehicleType: "Bus",
      amount: 12.00,  // Bus rate
      balanceAfter: 48.00,
      tollPlazaId: "plaza2",
      checkpoint: "Norton Toll Plaza",
      timestamp: "2024-11-14T20:10:00Z",
      licensePlate: "FFF-7890",
      readerId: "reader2"
    },
    // ADDITIONAL BULAWAYO TRANSACTIONS
    "trans6": {
      vehicleId: "vehicle1",
      ownerId: "owner1",
      rfid: "RFID001",
      vehicleType: "Small Car",
      amount: 5.00,
      balanceAfter: 40.00,
      tollPlazaId: "plaza5",
      checkpoint: "Bulawayo City Toll Plaza",
      timestamp: "2024-11-15T09:20:00Z",
      licensePlate: "AAA-1234",
      readerId: "reader5"
    },
    "trans7": {
      vehicleId: "vehicle4",
      ownerId: "owner3",
      rfid: "RFID004",
      vehicleType: "Truck",
      amount: 10.00,
      balanceAfter: 60.00,
      tollPlazaId: "plaza6",
      checkpoint: "Gwanda Road Toll Plaza",
      timestamp: "2024-11-15T11:30:00Z",
      licensePlate: "DDD-1121", 
      readerId: "reader6"
    },
    "trans8": {
      vehicleId: "vehicle6",
      ownerId: "owner5",
      rfid: "RFID006",
      vehicleType: "Bus",
      amount: 12.00,
      balanceAfter: 36.00,
      tollPlazaId: "plaza8",
      checkpoint: "Victoria Falls Road Toll Plaza",
      timestamp: "2024-11-15T13:45:00Z",
      licensePlate: "FFF-7890",
      readerId: "reader8"
    },
    // 🆕 NOMQHELE'S TRANSACTIONS
    "trans9": {
      vehicleId: "vehicle7",
      ownerId: "owner6",
      rfid: "RFID007",
      vehicleType: "Big Car",
      amount: 8.00,  // Big car rate
      balanceAfter: 67.00,
      tollPlazaId: "plaza1",
      checkpoint: "Harare-Chitungwiza Toll Plaza",
      timestamp: "2024-11-15T15:30:00Z",
      licensePlate: "NMQ-2024",
      readerId: "reader1"
    },
    "trans10": {
      vehicleId: "vehicle8",
      ownerId: "owner6",
      rfid: "RFID008",
      vehicleType: "Truck",
      amount: 10.00,  // Truck rate
      balanceAfter: 110.00,
      tollPlazaId: "plaza2",
      checkpoint: "Norton Toll Plaza",
      timestamp: "2024-11-15T17:45:00Z",
      licensePlate: "NMQ-7777",
      readerId: "reader2"
    }
  },

  // Payment history
  payments: {
    "pay1": {
      vehicleId: "vehicle1",
      ownerId: "owner1",
      amount: 50.00,
      balanceAfter: 50.00,
      paymentMethod: "EcoCash",
      referenceNumber: "EC240001234",
      timestamp: "2024-11-13T10:00:00Z"
    },
    "pay2": {
      vehicleId: "vehicle2", 
      ownerId: "owner1",
      amount: 25.00,
      balanceAfter: 25.00,
      paymentMethod: "OneMoney",
      referenceNumber: "OM240001567",
      timestamp: "2024-11-13T10:30:00Z"
    },
    "pay3": {
      vehicleId: "vehicle4",
      ownerId: "owner3", 
      amount: 80.00,
      balanceAfter: 80.00,
      paymentMethod: "Bank Transfer",
      referenceNumber: "BT240002890",
      timestamp: "2024-11-12T14:20:00Z"
    },
    // 🆕 NOMQHELE'S PAYMENT HISTORY
    "pay4": {
      vehicleId: "vehicle7",
      ownerId: "owner6",
      amount: 75.00,
      balanceAfter: 75.00,
      paymentMethod: "EcoCash",
      referenceNumber: "EC240003456",
      timestamp: "2024-11-15T12:00:00Z"
    },
    "pay5": {
      vehicleId: "vehicle8",
      ownerId: "owner6",
      amount: 120.00,
      balanceAfter: 120.00,
      paymentMethod: "Bank Transfer",
      referenceNumber: "BT240004567",
      timestamp: "2024-11-15T12:30:00Z"
    }
  },

  // Add user credentials section for easy reference
  userCredentials: {
    "admin_accounts": [
      {
        email: "admin@toll.gov.zw",
        password: "admin123",
        role: "admin",
        name: "System Administrator"
      },
      {
        email: "tinevimbo.nyoni@zinara.co.zw",
        password: "admin123",
        role: "admin",
        name: "Tinevimbo Nyoni"
      }
    ],
    "owner_accounts": [
      {
        email: "john.smith@gmail.com", 
        password: "owner123",
        role: "owner",
        name: "John Smith"
      },
      {
        email: "rebecca.too@gmail.com",
        password: "owner123", 
        role: "owner",
        name: "Rebecca Too"
      },
      {
        email: "charity.masiyiwa@gmail.com",
        password: "owner123",
        role: "owner", 
        name: "Charity Masiyiwa"
      },
      {
        email: "sarah.johnson@gmail.com",
        password: "owner123",
        role: "owner",
        name: "Sarah Johnson"
      },
      {
        email: "lisa.moyo@gmail.com",
        password: "owner123",
        role: "owner",
        name: "Lisa Moyo"
      },
      
      {
        email: "nomqhele.moyo@gmail.com",
        password: "owner123",
        role: "owner",
        name: "Nomqhele Moyo"
      }
    ]
  }
};

// Enhanced Seed Function for Zimbabwe
async function seedDatabase() {
  try {
    console.log('🇿🇼 Starting Zimbabwe Toll System database seeding...');
    
    // Clear existing data
    await db.ref().set(null);
    console.log('🗑️  Cleared existing data');
    
    // Seed Zimbabwe data
    await db.ref().set(seedData);
    console.log('✅ Zimbabwe database seeded successfully!');
    
    // Verify data
    const snapshot = await db.ref().once('value');
    const data = snapshot.val();
    
    console.log('\n📊 Zimbabwe Toll System Data Summary:');
    console.log(`👥 Vehicle Owners: ${Object.keys(data.owners || {}).length}`);
    console.log(`👨‍💼 System Admins: ${Object.keys(data.admins || {}).length}`);
    console.log(`🚗 Registered Vehicles: ${Object.keys(data.vehicles || {}).length}`);
    console.log(`🏢 Toll Plazas: ${Object.keys(data.tollPlazas || {}).length}`);
    console.log(`💰 Pricing Rules: ${Object.keys(data.pricingRules || {}).length}`);
    console.log(`📡 RFID Readers: ${Object.keys(data.hardwareEndpoints || {}).length}`);
    console.log(`🔧 Hardware Devices: ${Object.keys(data.hardware || {}).length}`); // NEW
    console.log(`💳 Transactions: ${Object.keys(data.transactions || {}).length}`);
    console.log(`💰 Payments: ${Object.keys(data.payments || {}).length}`);
    
    console.log('\n🎯 Zimbabwe Toll Pricing:');
    console.log('🏍️  Motorbikes: FREE');
    console.log('🚗 Small Cars: $5.00');
    console.log('🚙 Big Cars: $8.00'); 
    console.log('🚛 Trucks: $10.00');
    console.log('🚌 Buses: $12.00');
    
    console.log('\n🏗️ Toll Plazas:');
    console.log('📍 HARARE REGION:');
    console.log('• Harare-Chitungwiza (Seke Road)');
    console.log('• Norton (Harare-Bulawayo Highway)');
    console.log('• Beatrice (Harare-Masvingo Highway)');
    console.log('• Mukamuri (Harare-Mutare Highway)');
    console.log('📍 BULAWAYO REGION:');
    console.log('• Bulawayo City (Joshua Mqabuko Nkomo Road)');
    console.log('• Gwanda Road (Bulawayo-Beitbridge Highway)'); 
    console.log('• Plumtree (Bulawayo-Plumtree Highway)');
    console.log('• Victoria Falls Road (Bulawayo-Victoria Falls Highway)');
    
    console.log('\n🔧 Hardware Devices Added:');
    console.log('• 3 Arduino Boards (Connected)');
    console.log('• 5 RFID Readers (4 Active, 1 Offline)');
    console.log('• Covering all major toll plazas');
    
    console.log('\n🚗 Vehicle Fleet:');
    console.log('• 8 Total Vehicles (2 new for Nomqhele)');
    console.log('• 6 Vehicle Owners (including Nomqhele)');
    
    console.log('\n🎉 Zimbabwe Toll System ready!');
    console.log('\n🔧 Next Steps:');
    console.log('1. Run Django: python manage.py runserver 127.0.0.1:8001');
    console.log('2. Check admin dashboard for Zimbabwe data');
    console.log('3. Check hardware management page');
    console.log('4. Set up ESP32 RFID integration');
    
    console.log('\n👤 Login Credentials:');
    console.log('\n🔧 ADMIN ACCOUNTS:');
    seedData.userCredentials.admin_accounts.forEach(user => {
      console.log(`📧 ${user.email} / ${user.password} (${user.role})`);
    });
    
    console.log('\n🚗 OWNER ACCOUNTS:');
    seedData.userCredentials.owner_accounts.forEach(user => {
      console.log(`📧 ${user.email} / ${user.password} (${user.role})`);
    });
    
    console.log('\n🆕 NEW OWNER - Nomqhele Moyo:');
    console.log('📧 nomqhele.moyo@gmail.com / owner123 (owner)');
    console.log('🚙 BMW X5 2021 (NMQ-2024) - $75.00 balance');
    console.log('🚛 Mercedes-Benz Actros 2020 (NMQ-7777) - $120.00 balance');
    console.log('🏠 89 Greystone Park, Harare');
    console.log('📱 +263767890123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding Zimbabwe database:', error);
    process.exit(1);
  }
}

// Run Zimbabwe seeder
seedDatabase();
