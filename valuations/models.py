from django.db import models

# Create your models here.


class Valuation(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="valuations",
        on_delete=models.CASCADE
    )
    valuation = models.IntegerField(default=None)
    time_stamp = models.DateTimeField(default=None)

    def __str__(self):
        return f"{self.property}- {self.time_stamp}"
