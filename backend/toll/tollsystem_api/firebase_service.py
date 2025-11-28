import firebase_admin
from firebase_admin import credentials, db
from django.conf import settings
import logging
import os
from datetime import datetime
import json
import tempfile

logger = logging.getLogger(__name__)

class FirebaseService:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            try:
                # Check if Firebase is already initialized (prevent double init)
                if firebase_admin._apps:
                    self._initialized = True
                    self.db = db
                    logger.info("Firebase already initialized")
                    return
                
                # Use your original file-based approach for localhost
                if hasattr(settings, 'FIREBASE_CREDENTIALS_PATH') and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    firebase_admin.initialize_app(cred, {
                        'databaseURL': settings.FIREBASE_DATABASE_URL
                    })
                    self._initialized = True
                    self.db = db
                    logger.info("Firebase initialized with credentials file")
                
                else:
                    logger.error("Firebase credentials not found or path not set")
                    self._initialized = False
                    
            except Exception as e:
                logger.error(f"Firebase initialization error: {e}")
                self._initialized = False
    
    def get_owners(self):
        if not self._initialized:
            return None
        try:
            ref = db.reference('owners')
            return ref.get()
        except Exception as e:
            logger.error(f"Error getting owners: {e}")
            return None
    
    def get_vehicles(self):
        if not self._initialized:
            return None
        try:
            ref = db.reference('vehicles')
            return ref.get()
        except Exception as e:
            logger.error(f"Error getting vehicles: {e}")
            return None
    
    def get_vehicle_by_rfid(self, rfid):
        if not self._initialized:
            logger.error("Firebase not initialized")
            return None
        try:
            # Get all vehicles and search for matching RFID
            vehicles = self.get_vehicles()
            logger.info(f"Searching for RFID: {rfid}")
            logger.info(f"Available vehicles: {list(vehicles.keys()) if vehicles else 'None'}")
            
            if vehicles:
                for vehicle_id, vehicle in vehicles.items():
                    vehicle_rfid = vehicle.get('rfid')
                    logger.info(f"Vehicle {vehicle_id} has RFID: {vehicle_rfid}")
                    if vehicle_rfid == rfid:
                        logger.info(f"Found matching vehicle: {vehicle_id}")
                        return vehicle
            
            logger.error(f"No vehicle found with RFID: {rfid}")
            return None
        except Exception as e:
            logger.error(f"Error getting vehicle by RFID: {e}")
            return None
    
    def update_vehicle_balance(self, vehicle_id, new_balance):
        if not self._initialized:
            return False
        try:
            ref = db.reference(f'vehicles/{vehicle_id}')
            ref.update({'balance': new_balance})
            return True
        except Exception as e:
            logger.error(f"Error updating vehicle balance: {e}")
            return False
    
    def push_toll_record(self, data):
        if not self._initialized:
            return None
        try:
            ref = db.reference('transactions')
            return ref.push(data).key
        except Exception as e:
            logger.error(f"Firebase push toll record error: {e}")
            return None
    
    def push_payment_record(self, data):
        if not self._initialized:
            return None
        try:
            ref = db.reference('payments')
            return ref.push(data).key
        except Exception as e:
            logger.error(f"Firebase push payment record error: {e}")
            return None

firebase_service = FirebaseService()