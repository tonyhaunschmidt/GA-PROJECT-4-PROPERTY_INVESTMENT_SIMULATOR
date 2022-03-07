from .common import OfferSerializer
from mortgages.serializers.common import MortgageSerializer

# Serializers


class PopulatedOfferSerializer(OfferSerializer):
    mortgage = MortgageSerializer()
