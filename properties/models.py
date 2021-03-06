from django.db import models

# Create your models here.


class Property(models.Model):
    house_number_or_name = models.CharField(max_length=50, default=None)
    address = models.CharField(max_length=300, default=None)
    lon = models.FloatField(default=None)
    lat = models.FloatField(default=None)
    beds = models.IntegerField(default=None)
    bathrooms = models.IntegerField(default=None)
    schools = models.CharField(max_length=100, default=None)
    train_stations = models.CharField(max_length=100, default=None)
    level = models.IntegerField(default=None)
    short_description_level1 = models.CharField(max_length=300, default=None)
    short_description_level2 = models.CharField(max_length=300, default=None)
    short_description_level3 = models.CharField(max_length=300, default=None)
    long_description_level1 = models.TextField(max_length=3000, default=None)
    long_description_level2 = models.TextField(max_length=3000, default=None)
    long_description_level3 = models.TextField(max_length=3000, default=None)
    images_level1 = models.CharField(max_length=5000, default=None)
    images_level2 = models.CharField(max_length=5000, default=None)
    images_level3 = models.CharField(max_length=5000, default=None)
    base_rate_level1 = models.IntegerField(default=None)
    base_rate_level2 = models.IntegerField(default=None)
    base_rate_level3 = models.IntegerField(default=None)
    level1_improvement_cost = models.IntegerField(default=None)
    level2_improvement_cost = models.IntegerField(default=None)
    owner = models.ForeignKey(
        "jwt_auth.User",
        related_name="properties",
        on_delete=models.CASCADE
    )
    for_sale = models.BooleanField(default=None)
    asking_price = models.IntegerField(default=None)
    currently_let = models.BooleanField(default=None)
    mortgaged = models.BooleanField(default=None)
    void_upkeep = models.IntegerField(default=None)
    ownership_term = models.IntegerField(default=None)

    def __str__(self):
        return f"{self.house_number_or_name} {self.address}"
