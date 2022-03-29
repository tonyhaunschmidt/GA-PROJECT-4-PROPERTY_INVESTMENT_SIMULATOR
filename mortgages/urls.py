from django.urls import path
from .views import MortgageListView, MortgageDetailView, UserMortgagesListView, propertyMortgagesListView

urlpatterns = [
    path('', MortgageListView.as_view()),
    path('<int:pk>/', MortgageDetailView.as_view()),
    path('propertyspecific/<int:pk>/', propertyMortgagesListView.as_view()),
    path('userspecific/<int:pk>/', UserMortgagesListView.as_view()),
]
