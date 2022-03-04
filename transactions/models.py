from django.db import models

# Create your models here.


class Transaction(models.Model):
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
    time_stamp = models.TimeField()

    def __str__(self):
        return f"{self.property_id} {self.type}"
