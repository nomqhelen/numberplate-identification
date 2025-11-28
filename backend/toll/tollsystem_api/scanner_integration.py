import requests
import json
from django.conf import settings

class RFIDScanner:
    """Handle RFID scanner communication"""
    
    def __init__(self, scanner_ip, scanner_port=8080):
        self.scanner_ip = scanner_ip
        self.scanner_port = scanner_port
        self.base_url = f"http://{scanner_ip}:{scanner_port}"
    
    def receive_scan(self, rfid_data):
        """Process incoming RFID scan from scanner"""
        try:
            # Extract RFID tag from scanner data
            rfid_tag = rfid_data.get('rfid_tag')
            checkpoint = rfid_data.get('checkpoint', 'Unknown')
            timestamp = rfid_data.get('timestamp')
            
            # Send to Django API for processing
            response = requests.post(
                f"{settings.DJANGO_API_URL}/toll/rfid-scan/",
                json={
                    'rfid': rfid_tag,
                    'checkpoint': checkpoint,
                    'toll_amount': self.get_toll_amount(checkpoint),
                    'timestamp': timestamp
                },
                headers={'Content-Type': 'application/json'}
            )
            
            return response.json()
            
        except Exception as e:
            print(f"Scanner integration error: {e}")
            return {'error': str(e)}
    
    def get_toll_amount(self, checkpoint):
        """Get toll amount based on checkpoint"""
        toll_rates = {
            'Toll Plaza A': 5.00,
            'Toll Plaza B': 7.50,
            'Toll Plaza C': 6.00,
            'Toll Plaza D': 4.50,
        }
        return toll_rates.get(checkpoint, 5.00)