from __future__ import absolute_import, unicode_literals
from xmlrpc.client import _datetime_type

from celery import shared_task

from .models import User
from lettings.models import Letting
from properties.models import Property
from mortgages.models import Mortgage
from .serializers.common import userCapitalSerializer
from lettings.serializers.common import LettingSerializer
from lettings.serializers.populated import PopulatedLettingSerializer
from properties.serializers.common import PropertySerializer
from mortgages.serializers.common import MortgageSerializer

import math
from random import randrange
from datetime import datetime, timezone
from dateutil.parser import parse


@shared_task
def collect_rent_pay_bills():
    users = User.objects.all()
    serialized_users = userCapitalSerializer(users, many=True)

    for user in serialized_users.data:
        user_to_update = User.objects.get(pk=user['id'])
        serialized_user_to_update = userCapitalSerializer(user_to_update)

        capital = serialized_user_to_update.data['capital']

        users_properties = Property.objects.filter(
            owner=serialized_user_to_update.data['id'])
        serialized_properties = PropertySerializer(users_properties, many=True)

        for property in serialized_properties.data:
            # get letting
            property_lettings = Letting.objects.filter(property=property['id'])
            serialized_property_lettings = LettingSerializer(
                property_lettings, many=True)
            current_letting = {}
            for letting in serialized_property_lettings.data:
                if letting['current'] == True:
                    current_letting = letting

            # get mortgage
            property_mortgages = Mortgage.objects.filter(
                property=property['id'])
            serialized_property_mortgages = MortgageSerializer(
                property_mortgages, many=True)
            current_mortgage = {}
            for mortgage in serialized_property_mortgages.data:
                if mortgage['term_expiry'] != '1992-10-13T16:00:00Z':
                    current_mortgage = mortgage

            # letting logic to get rent and pay voids and letting fee
            baserate = 0
            if property['level'] == 1:
                capital = capital - property['void_upkeep']
            elif property['level'] == 2:
                baserate = property['base_rate_level2']
            elif property['level'] == 3:
                baserate = property['base_rate_level3']

            if current_letting == {}:
                capital = capital - property['void_upkeep']
            else:
                if current_letting['void'] == True:
                    capital = capital - property['void_upkeep']
                else:
                    capital = capital + baserate
                    if current_letting['grade'] == 'a':
                        capital = capital - math.ceil(baserate * 0.2)
                    elif current_letting['grade'] == 'b':
                        capital = capital - math.ceil(baserate * 0.15)
                    elif current_letting['grade'] == 'c':
                        capital = capital - math.ceil(baserate * 0.1)

            # mortgage logic - pay mortgage
            if current_mortgage != {}:
                capital = capital - \
                    math.ceil(
                        current_mortgage['loan_value'] * ((current_mortgage['interest'] / 100) / 12))

        payed_user = userCapitalSerializer(
            user_to_update, data={**serialized_user_to_update.data, 'capital': capital})
        payed_user.is_valid()
        payed_user.save()
