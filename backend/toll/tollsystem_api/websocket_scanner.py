import asyncio
import websockets
import json
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Start WebSocket server for RFID scanners'

    async def scanner_handler(self, websocket, path):
        """Handle WebSocket connections from scanners"""
        try:
            scanner_id = None
            async for message in websocket:
                data = json.loads(message)
                
                if data.get('type') == 'register':
                    scanner_id = data.get('scanner_id')
                    await websocket.send(json.dumps({
                        'type': 'registered',
                        'scanner_id': scanner_id,
                        'status': 'connected'
                    }))
                    print(f"Scanner {scanner_id} connected")
                
                elif data.get('type') == 'rfid_scan':
                    # Process RFID scan
                    result = await self.process_rfid_scan(data)
                    await websocket.send(json.dumps(result))
                    
        except websockets.exceptions.ConnectionClosed:
            print(f"Scanner {scanner_id} disconnected")
        except Exception as e:
            print(f"Scanner error: {e}")

    async def process_rfid_scan(self, data):
        """Process RFID scan asynchronously"""
        # Call your Django view logic here
        # Return result to scanner
        return {
            'type': 'scan_result',
            'success': True,
            'transaction_id': 'TXN_001'
        }

    def handle(self, *args, **options):
        start_server = websockets.serve(
            self.scanner_handler, 
            "localhost", 
            8765
        )
        
        print("WebSocket server started on ws://localhost:8765")
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()