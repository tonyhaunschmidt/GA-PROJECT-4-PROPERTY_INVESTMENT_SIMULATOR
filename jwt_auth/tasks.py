from __future__ import absolute_import, unicode_literals
from xmlrpc.client import _datetime_type

from celery import shared_task

from .models import User
from lettings.models import Letting
from properties.models import Property
from mortgages.models import Mortgage
from transactions.models import Transaction
from .serializers.common import userCapitalSerializer
from lettings.serializers.common import LettingSerializer
from lettings.serializers.populated import PopulatedLettingSerializer
from properties.serializers.common import PropertySerializer
from mortgages.serializers.common import MortgageSerializer
from transactions.serializers.common import TransactionSerializer

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
            capital_change = 0
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
                capital_change = capital_change - property['void_upkeep']
            elif property['level'] == 2:
                baserate = property['base_rate_level2']
            elif property['level'] == 3:
                baserate = property['base_rate_level3']

            if current_letting == {}:
                if property['level'] != 1:
                    capital_change = capital_change - property['void_upkeep']
            else:
                if current_letting['void'] == True:
                    capital_change = capital_change - property['void_upkeep']
                else:
                    capital_change = capital_change + baserate
                    if current_letting['grade'] == 'A':
                        capital_change = capital_change - \
                            math.ceil(baserate * 0.2)
                    elif current_letting['grade'] == 'B':
                        capital_change = capital_change - \
                            math.ceil(baserate * 0.15)
                    elif current_letting['grade'] == 'C':
                        capital_change = capital_change - \
                            math.ceil(baserate * 0.1)

            # mortgage logic - pay mortgage
            if current_mortgage != {}:
                capital_change = capital_change - \
                    math.ceil(
                        current_mortgage['loan_value'] * ((current_mortgage['interest'] / 100) / 12))

            # save capital change
            capital = capital + capital_change

            # save transaction
            serialized_transaction = TransactionSerializer(data={'type': 'income',
                                                                 'property': property['id'],
                                                                 'owner': serialized_user_to_update.data['id'],
                                                                 'amount': capital_change,
                                                                 'stamp_duty': 0,
                                                                 'fees': 0,
                                                                 'property_ownership_term': property['ownership_term']})
            serialized_transaction.is_valid()
            serialized_transaction.save()

        # update user
        payed_user = userCapitalSerializer(
            user_to_update, data={**serialized_user_to_update.data, 'capital': capital})
        payed_user.is_valid()
        payed_user.save()
