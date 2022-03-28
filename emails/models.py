from django.db import models

# Create your models here.


class Email(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="emails",
        on_delete=models.CASCADE
    )
    recipient = models.ForeignKey(
        "jwt_auth.User",
        related_name="emails",
        on_delete=models.CASCADE
    )
    subject = models.CharField(max_length=300, default=None)
    read = models.BooleanField(default=None)
    time_stamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.property} - {self.subject} : {self.time_stamp}"
