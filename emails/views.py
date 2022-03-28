from django.dispatch import receiver
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.db import IntegrityError

from .models import Email
from .serializers.common import EmailSerializer
from .serializers.populated import PopulatedEmailSerializer

from rest_framework.permissions import IsAuthenticatedOrReadOnly

# Create your views here.


class EmailListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def post(self, request):
        serialized_data = EmailSerializer(data=request.data)
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


class UserEmailListView(APIView):
    #permission_classes = (IsAuthenticatedOrReadOnly,)

    def get(self, _request, pk):
        emails = Email.objects.filter(recipient=pk)
        serialized_emails = PopulatedEmailSerializer(emails, many=True)
        return Response(serialized_emails.data, status=status.HTTP_200_OK)


class EmailDetailView(APIView):
    def get_email(self, pk):
        try:
            return Email.objects.get(pk=pk)
        except Email.DoesNotExist:
            raise NotFound(detail="Email not found")

    def put(self, request, pk):
        email_to_update = self.get_email(pk=pk)
        serialized_email = EmailSerializer(
            email_to_update, data=request.data)
        try:
            serialized_email.is_valid()
            serialized_email.save()
            return Response(serialized_email.data, status=status.HTTP_202_ACCEPTED)
        except AssertionError as e:
            return Response({"detail": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except:
            return Response("Unprocessable Entity", status=status.HTTP_422_UNPROCESSABLE_ENTITY)
