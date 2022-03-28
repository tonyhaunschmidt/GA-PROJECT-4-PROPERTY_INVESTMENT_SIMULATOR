from pickle import TRUE
from typing_extensions import Required
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField()
    capital = models.IntegerField(default=25000)
    saved_properties = models.ManyToManyField(
        "properties.Property",
        related_name="saved_by",
        default=[],
        blank=True
    )

    def __str__(self):
        return f'{self.username}'
