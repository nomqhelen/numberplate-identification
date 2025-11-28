from django.urls import path
from . import views

urlpatterns = [
    # FIXED - Use the actual function names from your views.py
    path('test-firebase/', views.test_firebase, name='test_firebase'),  # NOT test_firebase_connection!
    
    # Admin endpoints - FIXED function names
    path('admin/vehicles/', views.admin_get_vehicles, name='admin_vehicles'),
    path('admin/owners/', views.admin_get_owners, name='admin_owners'), 
    path('admin/suspended-vehicles/', views.get_suspended_vehicles, name='suspended_vehicles'),
    path('admin/add-owner/', views.admin_add_owner, name='add_owner'),
    path('admin/vehicle/<str:vehicle_id>/status/', views.update_vehicle_status, name='update_vehicle_status'),
    
    # Owner endpoints
    path('owner/<str:owner_id>/', views.get_owner_details, name='owner_details'),
    path('owner/<str:owner_id>/vehicles/', views.get_owner_vehicles, name='owner_vehicles'),
    path('owner/<str:owner_id>/tolls/', views.get_owner_tolls, name='owner_tolls'),
    path('owner/<str:owner_id>/payments/', views.get_owner_payments, name='owner_payments'),
    
    # Vehicle management
    path('vehicle/<str:vehicle_id>/recharge/', views.recharge_vehicle, name='recharge_vehicle'),
    path('vehicle/<str:vehicle_id>/suspend/', views.suspend_vehicle, name='suspend_vehicle'),
    path('vehicle/<str:vehicle_id>/reactivate/', views.reactivate_vehicle, name='reactivate_vehicle'),
    
    # Toll processing - FIXED function name
    path('toll/rfid-scan/', views.rfid_toll_scan, name='rfid_scan'),
    
    # Scanner
    path('scanner/heartbeat/', views.scanner_heartbeat, name='scanner_heartbeat'),
]