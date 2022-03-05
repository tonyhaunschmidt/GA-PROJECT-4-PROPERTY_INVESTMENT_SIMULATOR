from django.shortcuts import render
# APIView - default view class to extend
from rest_framework.views import APIView
# get_user_model returns active User model
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers.common import UserSerializer

User = get_user_model()

# Create your views here.


class RegisterView(APIView):

    def post(self, request):
        user_to_create = UserSerializer(data=request.data)
        try:
            user_to_create.is_valid()
            user_to_create.save()
            return Response(user_to_create.data, status=status.HTTP_201_CREATED)
        except:
            return Response("Failed to create user", status=status.HTTP_422_UNPROCESSABLE_ENTITY)
