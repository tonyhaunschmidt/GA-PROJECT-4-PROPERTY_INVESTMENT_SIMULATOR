from django.db import models
from django.forms import CharField

# Create your models here.


class Transaction(models.Model):
    type = models.CharField(max_length=60, default=None)
    property = models.ForeignKey(
        "properties.Property",
        related_name="transactions",
        on_delete=models.CASCADE
    )
    owner = models.ForeignKey(
        "jwt_auth.User",
        related_name="transactions",
        on_delete=models.CASCADE
    )
    amount = models.IntegerField(default=None)
    stamp_duty = models.IntegerField(default=None)
    legal_fees = models.IntegerField(default=None)
    time_stamp = models.DateTimeField(default=None)

    def __str__(self):
        return f"{self.property} {self.type}"
