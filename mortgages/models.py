from django.db import models

# Create your models here.


class Mortgage(models.Model):
    property = models.ForeignKey(
        "properties.Property",
        related_name="mortgages",
        on_delete=models.CASCADE
    )
    owner = models.ForeignKey(
        "jwt_auth.User",
        related_name="mortgages",
        on_delete=models.CASCADE
    )
    LTV = models.IntegerField(default=None)
    loan_value = models.IntegerField(default=None)
    term_expiry = models.DateTimeField(default=None)
    interest = models.IntegerField(default=None)

    def __str__(self):
        return f"{self.property} {self.owner} "
