from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Property
from .serializers.common import PropertySerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class PropertyListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request):
        properties = Property.objects.all()
        serialized_properties = PropertySerializer(properties, many=True)
        return Response(serialized_properties.data, status=status.HTTP_200_OK)


class MarketplaceListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request):
        properties = Property.objects.filter(for_sale=True)
        serialized_properties = PropertySerializer(properties, many=True)
        return Response(serialized_properties.data, status=status.HTTP_200_OK)
