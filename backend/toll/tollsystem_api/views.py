from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .firebase_service import firebase_service
import json
import logging
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)

@api_view(['GET'])
def test_firebase(request):
    """Test Firebase connection"""
    try:
        owners = firebase_service.get_owners()
        vehicles = firebase_service.get_vehicles()
        
        return Response({
            'firebase_connected': True,
            'owners_count': len(owners) if owners else 0,
            'vehicles_count': len(vehicles) if vehicles else 0,
            'sample_data': {
                'owners': list(owners.keys())[:3] if owners else [],
                'vehicles': list(vehicles.keys())[:3] if vehicles else []
            }
        })
    except Exception as e:
        return Response({
            'firebase_connected': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_owner_details(request, owner_id):
    """Get owner details with their vehicles"""
    try:
        owners = firebase_service.get_owners()
        vehicles = firebase_service.get_vehicles()
        
        if not owners or owner_id not in owners:
            return Response({'error': 'Owner not found'}, status=status.HTTP_404_NOT_FOUND)
        
        owner = owners[owner_id]
        owner_vehicles = []
        
        if vehicles:
            for vehicle_id, vehicle in vehicles.items():
                if vehicle.get('ownerId') == owner_id:
                    vehicle_data = vehicle.copy()
                    vehicle_data['id'] = vehicle_id
                    owner_vehicles.append(vehicle_data)
        
        return Response({
            'id': owner_id,
            'name': owner.get('name'),
            'email': owner.get('email'),
            'vehicles': owner_vehicles
        })
    except Exception as e:
        logger.error(f"Error getting owner details: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_owner_vehicles(request, owner_id):
    """Get all vehicles for an owner"""
    try:
        vehicles = firebase_service.get_vehicles()
        owner_vehicles = []
        
        if vehicles:
            for vehicle_id, vehicle in vehicles.items():
                if vehicle.get('ownerId') == owner_id:
                    vehicle_data = vehicle.copy()
                    vehicle_data['id'] = vehicle_id
                    owner_vehicles.append(vehicle_data)
        
        return Response(owner_vehicles)
    except Exception as e:
        logger.error(f"Error getting owner vehicles: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_owner_payments(request, owner_id):
    """Get payment history for an owner"""
    try:
        # Get all payments and filter client-side to avoid Firebase index requirement
        ref = firebase_service.db.reference('payments')
        all_payments = ref.get()
        
        payment_list = []
        if all_payments:
            for payment_id, payment in all_payments.items():
                if payment.get('ownerId') == owner_id:
                    payment_data = payment.copy()
                    payment_data['id'] = payment_id
                    payment_list.append(payment_data)
        
        # Sort by timestamp, newest first
        payment_list.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        return Response(payment_list)
    except Exception as e:
        logger.error(f"Error getting owner payments: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_owner_tolls(request, owner_id):
    """Get toll history for an owner"""
    try:
        # Get all transactions and filter client-side
        ref = firebase_service.db.reference('transactions')
        all_transactions = ref.get()
        
        toll_list = []
        if all_transactions:
            for transaction_id, transaction in all_transactions.items():
                if transaction.get('ownerId') == owner_id:
                    transaction_data = transaction.copy()
                    transaction_data['id'] = transaction_id
                    toll_list.append(transaction_data)
        
        # Sort by timestamp, newest first
        toll_list.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        return Response(toll_list)
    except Exception as e:
        logger.error(f"Error getting owner tolls: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def recharge_vehicle(request, vehicle_id):
    """Recharge vehicle balance"""
    try:
        data = json.loads(request.body)
        amount = float(data.get('amount', 0))
        
        if amount <= 0:
            return Response({'error': 'Amount must be positive'}, status=status.HTTP_400_BAD_REQUEST)
        
        vehicles = firebase_service.get_vehicles()
        if not vehicles or vehicle_id not in vehicles:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        vehicle = vehicles[vehicle_id]
        current_balance = float(vehicle.get('balance', 0))
        new_balance = current_balance + amount
        
        # Update vehicle balance
        success = firebase_service.update_vehicle_balance(vehicle_id, new_balance)
        
        if success:
            # Record payment
            payment_data = {
                'vehicleId': vehicle_id,
                'ownerId': vehicle.get('ownerId'),
                'amount': amount,
                'balanceAfter': new_balance,
                'timestamp': datetime.now().isoformat()
            }
            firebase_service.push_payment_record(payment_data)
            
            return Response({
                'success': True,
                'new_balance': new_balance,
                'amount_added': amount
            })
        else:
            return Response({'error': 'Failed to update balance'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        logger.error(f"Error recharging vehicle: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def admin_get_vehicles(request):
    """Get all vehicles for admin"""
    try:
        month = request.GET.get('month')
        vehicles = firebase_service.get_vehicles()
        
        vehicle_list = []
        if vehicles:
            for vehicle_id, vehicle in vehicles.items():
                vehicle_data = vehicle.copy()
                vehicle_data['id'] = vehicle_id
                vehicle_list.append(vehicle_data)
        
        return Response(vehicle_list)
    except Exception as e:
        logger.error(f"Error getting vehicles: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def update_vehicle_status(request, vehicle_id):
    """Update vehicle status"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if new_status not in ['active', 'inactive', 'suspended']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        ref = firebase_service.db.reference(f'vehicles/{vehicle_id}')
        ref.update({'status': new_status})
        
        return Response({'success': True, 'new_status': new_status})
    except Exception as e:
        logger.error(f"Error updating vehicle status: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def admin_get_owners(request):
    """Get all owners for admin"""
    try:
        owners = firebase_service.get_owners()
        owner_list = []
        
        if owners:
            for owner_id, owner in owners.items():
                owner_data = owner.copy()
                owner_data['id'] = owner_id
                owner_list.append(owner_data)
        
        return Response(owner_list)
    except Exception as e:
        logger.error(f"Error getting owners: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def admin_add_owner(request):
    """Add new owner"""
    try:
        data = json.loads(request.body)
        
        owner_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'createdAt': datetime.now().isoformat()
        }
        
        ref = firebase_service.db.reference('owners')
        new_owner = ref.push(owner_data)
        
        return Response({'success': True, 'owner_id': new_owner.key})
    except Exception as e:
        logger.error(f"Error adding owner: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
def rfid_toll_scan(request):
    """Process RFID scan from scanner hardware"""
    try:
        # Only check scanner token if it's provided (for hardware scanners)
        # Allow manual toll additions without token
        token = request.headers.get('X-Scanner-Token') or request.META.get('HTTP_X_SCANNER_TOKEN')
        
        # If token is provided, validate it (hardware scanner)
        # If no token, allow it (manual addition from frontend)
        if token and token != settings.SCANNER_TOKEN:
            logger.warning(f"Unauthorized scanner access attempt with token: {token}")
            return Response({
                'error': 'Unauthorized - Invalid scanner token',
                'success': False
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Parse incoming data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST.dict()
            
        rfid = data.get('rfid')
        checkpoint = data.get('checkpoint', 'Unknown')
        toll_amount = float(data.get('toll_amount', 5.00))
        scanner_id = data.get('scanner_id', 'Unknown')
        
        logger.info(f"RFID scan received: {rfid} at {checkpoint}")
        
        if not rfid:
            return Response({
                'error': 'RFID tag is required',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find vehicle by RFID
        vehicles = firebase_service.get_vehicles()
        vehicle = None
        vehicle_id = None
        
        if vehicles:
            for vid, v in vehicles.items():
                if v.get('rfid') == rfid:
                    vehicle = v
                    vehicle_id = vid
                    break
        
        if not vehicle:
            logger.warning(f"Vehicle not found for RFID: {rfid}")
            return Response({
                'error': 'Vehicle not found',
                'success': False,
                'rfid': rfid
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check vehicle status
        if vehicle.get('status') != 'active':
            logger.warning(f"Vehicle {vehicle_id} is not active: {vehicle.get('status')}")
            return Response({
                'error': f"Vehicle is {vehicle.get('status')}",
                'success': False,
                'license_plate': vehicle.get('licensePlate')
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check balance
        current_balance = float(vehicle.get('balance', 0))
        if current_balance < toll_amount:
            logger.warning(f"Insufficient balance: {current_balance} < {toll_amount}")
            return Response({
                'error': 'Insufficient balance',
                'success': False,
                'current_balance': current_balance,
                'required_amount': toll_amount,
                'license_plate': vehicle.get('licensePlate')
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Process toll payment
        new_balance = current_balance - toll_amount
        
        # Update vehicle balance in Firebase
        success = firebase_service.update_vehicle_balance(vehicle_id, new_balance)
        
        if success:
            # Create transaction record
            transaction_data = {
                'vehicleId': vehicle_id,
                'ownerId': vehicle.get('ownerId'),
                'amount': toll_amount,
                'balanceAfter': new_balance,
                'balanceBefore': current_balance,
                'checkpoint': checkpoint,
                'scannerId': scanner_id,
                'licensePlate': vehicle.get('licensePlate'),
                'rfidTag': rfid,
                'timestamp': datetime.now().isoformat(),
                'status': 'completed'
            }
            
            transaction_id = firebase_service.push_toll_record(transaction_data)
            
            logger.info(f"Toll processed: {transaction_id} - ${toll_amount} from {vehicle.get('licensePlate')}")
            
            return Response({
                'success': True,
                'transaction_id': transaction_id,
                'toll_amount': toll_amount,
                'license_plate': vehicle.get('licensePlate'),
                'new_balance': new_balance,
                'previous_balance': current_balance,
                'checkpoint': checkpoint,
                'timestamp': datetime.now().isoformat()
            }, status=status.HTTP_200_OK)
        else:
            logger.error(f"Failed to update vehicle balance for {vehicle_id}")
            return Response({
                'error': 'Failed to process payment',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except ValueError as e:
        logger.error(f"Value error in toll processing: {e}")
        return Response({
            'error': f'Invalid data: {str(e)}',
            'success': False
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Unexpected error in toll processing: {e}")
        return Response({
            'error': 'Internal server error',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def scanner_heartbeat(request):
    """Receive heartbeat from scanner to check connectivity"""
    try:
        data = json.loads(request.body) if request.body else {}
        scanner_id = data.get('scanner_id', 'unknown')
        scanner_status = data.get('status', 'online')
        
        logger.info(f"Heartbeat received from scanner {scanner_id}: {scanner_status}")
        
        return Response({
            'success': True,
            'message': 'Heartbeat received',
            'server_time': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Scanner heartbeat error: {e}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def suspend_vehicle(request, vehicle_id):
    """Suspend a vehicle (mark as missing/stolen)"""
    try:
        # Get vehicle data from Firebase
        vehicles = firebase_service.get_vehicles()
        
        if not vehicles or vehicle_id not in vehicles:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        vehicle_data = vehicles[vehicle_id]
        
        # Update vehicle status to suspended
        ref = firebase_service.db.reference(f'vehicles/{vehicle_id}')
        ref.update({
            'status': 'suspended',
            'suspendedAt': datetime.now().isoformat(),
            'reactivatedAt': None
        })
        
        return Response({
            'success': True,
            'message': 'Vehicle suspended successfully',
            'vehicle_id': vehicle_id,
            'license_plate': vehicle_data.get('licensePlate'),
            'status': 'suspended'
        })
        
    except Exception as e:
        logger.error(f"Error suspending vehicle: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def reactivate_vehicle(request, vehicle_id):
    """Reactivate a suspended vehicle"""
    try:
        # Get vehicle data from Firebase
        vehicles = firebase_service.get_vehicles()
        
        if not vehicles or vehicle_id not in vehicles:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
        
        vehicle_data = vehicles[vehicle_id]
        
        if vehicle_data.get('status') != 'suspended':
            return Response({'error': 'Vehicle is not suspended'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update vehicle status to active
        ref = firebase_service.db.reference(f'vehicles/{vehicle_id}')
        ref.update({
            'status': 'active',
            'reactivatedAt': datetime.now().isoformat(),
            'suspendedAt': None
        })
        
        return Response({
            'success': True,
            'message': 'Vehicle reactivated successfully',
            'vehicle_id': vehicle_id,
            'license_plate': vehicle_data.get('licensePlate'),
            'status': 'active'
        })
        
    except Exception as e:
        logger.error(f"Error reactivating vehicle: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_suspended_vehicles(request):
    """Get all suspended vehicles for admin missing vehicles report"""
    try:
        # Get all vehicles from Firebase
        vehicles = firebase_service.get_vehicles()
        
        if not vehicles:
            return Response([])
        
        suspended_vehicles = []
        
        # Filter for suspended vehicles
        for vehicle_id, vehicle_data in vehicles.items():
            if vehicle_data.get('status') == 'suspended':
                suspended_vehicles.append({
                    'id': vehicle_id,
                    'licensePlate': vehicle_data.get('licensePlate'),
                    'rfid': vehicle_data.get('rfid'),
                    'type': vehicle_data.get('type'),
                    'ownerName': vehicle_data.get('ownerName'),
                    'ownerId': vehicle_data.get('ownerId'),
                    'suspendedAt': vehicle_data.get('suspendedAt'),
                    'make': vehicle_data.get('make'),
                    'model': vehicle_data.get('model'),
                    'year': vehicle_data.get('year'),
                    'balance': vehicle_data.get('balance', 0)
                })
        
        return Response(suspended_vehicles)
        
    except Exception as e:
        logger.error(f"Error getting suspended vehicles: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)