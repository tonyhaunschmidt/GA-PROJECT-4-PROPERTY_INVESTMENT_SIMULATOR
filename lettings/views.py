from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Letting
from .serializers.common import LettingSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class LettingListView(APIView):
    permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        print(request.data)
        serialized_data = LettingSerializer(data=request.data)
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


class LettingDetailView(APIView):
    def get_letting(self, pk):
        try:
            return Letting.objects.get(pk=pk)
        except Letting.DoesNotExist:
            raise NotFound(detail="Mortgage not found")

    def put(self, request, pk):
        letting_to_update = self.get_letting(pk=pk)
        serialized_letting = LettingSerializer(
            letting_to_update, data=request.data)
        try:
            serialized_letting.is_valid()
            serialized_letting.save()
            return Response(serialized_letting.data, status=status.HTTP_202_ACCEPTED)
        except AssertionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except:
            return Response("Unprocessable Entity", status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class propertyLettingsListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        lettings = Letting.objects.filter(property=pk)
        serialized_lettings = LettingSerializer(lettings, many=True)
        return Response(serialized_lettings.data, status=status.HTTP_200_OK)
