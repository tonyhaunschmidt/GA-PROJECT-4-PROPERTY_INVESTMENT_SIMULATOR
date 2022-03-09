from django.urls import path
from .views import TransactionListView, UserTransactionListView, propertyTransactionListView

urlpatterns = [
    path('', TransactionListView.as_view()),
    path('/propertyspecific/<int:pk>', propertyTransactionListView.as_view()),
    path('/userspecific/<int:pk>', UserTransactionListView.as_view()),
]
