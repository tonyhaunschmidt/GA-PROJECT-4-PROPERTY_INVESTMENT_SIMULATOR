from django.urls import path
from .views import TransactionListView, propertyTransactionListView

urlpatterns = [
    path('', TransactionListView.as_view()),
    path('/propertyspecific/<int:pk>', propertyTransactionListView.as_view()),
]
