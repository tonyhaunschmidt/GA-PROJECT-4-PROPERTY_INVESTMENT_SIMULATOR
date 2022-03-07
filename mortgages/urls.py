from django.urls import path
from .views import MortgageListView

urlpatterns = [
    path('', MortgageListView.as_view()),
]
