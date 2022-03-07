from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Offer
from .serializers.common import OfferSerializer
#from .serializers.populated import PopulatedFestivalSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class OfferListView(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        serialized_data = OfferSerializer(data=request.data)
        print(request.data)
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


class propertyOffersListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        offers = Offer.objects.filter(property=pk)
        serialized_properties = OfferSerializer(offers, many=True)
        return Response(serialized_properties.data, status=status.HTTP_200_OK)
