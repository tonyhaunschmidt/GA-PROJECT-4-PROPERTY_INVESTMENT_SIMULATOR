from django.db import models

# Create your models here.


class Email(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="emails",
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.property_id} {self.subject}"  # look over
