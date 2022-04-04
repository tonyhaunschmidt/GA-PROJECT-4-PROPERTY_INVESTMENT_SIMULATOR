from .common import EmailSerializer
from properties.models import Property
from rest_framework import serializers

# Serializers


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ("id", "house_number_or_name", "address")


class PopulatedEmailSerializer(EmailSerializer):
    property = PropertySerializer()
