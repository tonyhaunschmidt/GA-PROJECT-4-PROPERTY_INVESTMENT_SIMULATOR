from rest_framework import serializers
from ..models import Letting


class LettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letting
        fields = '__all__'
