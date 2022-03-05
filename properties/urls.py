from django.urls import path
from .views import PropertyListView, MarketplaceListView

urlpatterns = [
    path('', PropertyListView.as_view()),
    path('/marketplace', MarketplaceListView.as_view()),
]
