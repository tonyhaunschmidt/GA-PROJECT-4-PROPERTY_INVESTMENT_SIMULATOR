from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Mortgage
from .serializers.common import MortgageSerializer
#from .serializers.populated import PopulatedFestivalSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class MortgageListView(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        serialized_data = MortgageSerializer(data=request.data)
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


class MortgageDetailView(APIView):
    def get_mortgage(self, pk):
        try:
            return Mortgage.objects.get(pk=pk)
        except Mortgage.DoesNotExist:
            raise NotFound(detail="Mortgage not found")

    def put(self, request, pk):
        mortgage_to_update = self.get_mortgage(pk=pk)
        serialized_mortgage = MortgageSerializer(
            mortgage_to_update, data=request.data)
        try:
            serialized_mortgage.is_valid()
            serialized_mortgage.save()
            return Response(serialized_mortgage.data, status=status.HTTP_202_ACCEPTED)
        except AssertionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except:
            return Response("Unprocessable Entity", status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class propertyMortgagesListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        mortgages = Mortgage.objects.filter(property=pk)
        serialized_mortgages = MortgageSerializer(mortgages, many=True)
        return Response(serialized_mortgages.data, status=status.HTTP_200_OK)


class UserMortgagesListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        mortgages = Mortgage.objects.filter(owner=pk)
        serialized_mortgages = MortgageSerializer(mortgages, many=True)
        return Response(serialized_mortgages.data, status=status.HTTP_200_OK)
