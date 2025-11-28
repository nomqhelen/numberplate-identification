# Create your models here.
from django.db import models

class Owner(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)
    plate_number = models.CharField(max_length=20, unique=True)
    rfid_tag = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='active')

    def __str__(self):
        return self.plate_number

class TollRecord(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    toll_amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=200)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)

class Payment(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)