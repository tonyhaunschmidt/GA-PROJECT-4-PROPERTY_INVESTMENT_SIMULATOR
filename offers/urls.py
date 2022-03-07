from django.urls import path
from .views import OfferListView, propertyOffersListView

urlpatterns = [
    path('', OfferListView.as_view()),
    path('/propertyspecific/<int:pk>', propertyOffersListView.as_view()),
]
