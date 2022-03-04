from django.db import models

# Create your models here.


class Offer(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="offers",
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.property_id} {self.type}"  # look over
