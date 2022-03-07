from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Offer
from .serializers.common import OfferSerializer
from .serializers.populated import PopulatedOfferSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class OfferListView(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        serialized_data = OfferSerializer(data=request.data)
        try:
            serialized_data.is_valid()
            serialized_data.save()
            return Response(serialized_data.data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({"detail INTEG": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except AssertionError as e:
            return Response({"detail ASSER": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except:
            return Response(
                {"detail": "Unprocessable Entity"},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )


class OfferDetailView(APIView):
    def get_offer(self, pk):
        try:
            return Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            raise NotFound(detail="Offer not found")

    def put(self, request, pk):
        offer_to_update = self.get_offer(pk=pk)
        serialized_offer = OfferSerializer(offer_to_update, data=request.data)
        try:
            serialized_offer.is_valid()
            serialized_offer.save()
            return Response(serialized_offer.data, status=status.HTTP_202_ACCEPTED)
        except AssertionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except:
            return Response("Unprocessable Entity", status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class propertyOffersListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        offers = Offer.objects.filter(property=pk)
        serialized_offers = PopulatedOfferSerializer(offers, many=True)
        return Response(serialized_offers.data, status=status.HTTP_200_OK)
