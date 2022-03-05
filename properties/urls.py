from django.urls import path
from .views import PropertyListView, MarketplaceListView, PropertyDetailView

urlpatterns = [
    path('', PropertyListView.as_view()),
    path('/marketplace', MarketplaceListView.as_view()),
    path('/<int:pk>', PropertyDetailView.as_view())
]
