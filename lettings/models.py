from django.db import models

# Create your models here.


class Letting(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="lettings",
        on_delete=models.CASCADE
    )
    current = models.BooleanField(default=None)
    grade = models.CharField(max_length=1, default=None)
    void = models.BooleanField(default=None)
    rent_percentage_fee = models.IntegerField(default=None)

    def __str__(self):
        return f"{self.property} {self.current}"  # look over
