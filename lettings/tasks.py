from __future__ import absolute_import
from xmlrpc.client import _datetime_type

from celery import shared_task

from .models import Letting
from .serializers.common import LettingSerializer

from random import randrange
from datetime import datetime, timezone
from dateutil.parser import parse


@shared_task
def add(x, y):
    return x + y


@shared_task
def find_tenants():
    lettings = Letting.objects.all()
    serialized_lettings = LettingSerializer(lettings, many=True)

# this works
  #  letting = Letting.objects.get(pk=1)
  #  updated_letting = LettingSerializer(
  #  serialized_letting = LettingSerializer(letting)
  #      letting, data={**serialized_letting.data, "current": True})
  #  updated_letting.is_valid()
  #  updated_letting.save()
  #  return updated_letting.data
# --

    for letting in serialized_lettings.data:
        letting_to_update = Letting.objects.get(pk=letting['id'])
        serialized_letting_to_update = LettingSerializer(letting_to_update)
        tenant_chance_factor = randrange(100)
        tenants_found = False
        # return parse(serialized_letting_to_update.data['fixed_void'])
        if serialized_letting_to_update.data['void'] == True and serialized_letting_to_update.data['current'] == True and parse(serialized_letting_to_update.data['fixed_void']) < datetime.now(timezone.utc):
            if serialized_letting_to_update.data['grade'] == 'a':
                if(tenant_chance_factor > 30):
                    tenants_found = True
            elif serialized_letting_to_update.data['grade'] == 'b':
                if(tenant_chance_factor > 70):
                    tenants_found = True
            elif serialized_letting_to_update.data['grade'] == 'c':
                if(tenant_chance_factor > 90):
                    tenants_found = True
            if(tenants_found == True):
                tenant_letting = LettingSerializer(
                    letting_to_update, data={**serialized_letting_to_update.data, "void": False})
                tenant_letting.is_valid()
                tenant_letting.save()
