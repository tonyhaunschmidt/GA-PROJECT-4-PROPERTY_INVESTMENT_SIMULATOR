from django.urls import path
from .views import OfferListView, UserOffersListView, propertyOffersListView, OfferDetailView

urlpatterns = [
    path('', OfferListView.as_view()),
    path('<int:pk>/', OfferDetailView.as_view()),
    path('propertyspecific/<int:pk>/', propertyOffersListView.as_view()),
    path('userspecific/<int:pk>/', UserOffersListView.as_view()),
]
