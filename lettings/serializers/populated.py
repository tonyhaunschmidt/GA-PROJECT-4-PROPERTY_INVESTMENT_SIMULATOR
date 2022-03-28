from .common import LettingSerializer
from properties.serializers.common import PropertySerializer

# Serializers


class PopulatedLettingSerializer(LettingSerializer):
    property = PropertySerializer()
