from django.db import models

# Create your models here.


class Offer(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="offers",
        on_delete=models.CASCADE
    )
    owner = models.ForeignKey(
        "jwt_auth.User",
        related_name="offers",
        on_delete=models.CASCADE
    )
    mortgage = models.ForeignKey(
        "mortgages.Mortgage",
        related_name="offers",
        on_delete=models.CASCADE
    )
    offer_Value = models.IntegerField(default=None)
    stamp_duty = models.IntegerField(default=None)
    legal_fees = models.IntegerField(default=None)
    accepted = models.BooleanField(default=None)
    retracted = models.BooleanField(default=None)
    time_stamp = models.DateTimeField(default=None)

    def __str__(self):
        return f"{self.property}- {self.owner}"
