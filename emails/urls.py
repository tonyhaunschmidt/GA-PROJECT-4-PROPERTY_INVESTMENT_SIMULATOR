from django.urls import path
from .views import EmailDetailView, EmailListView, UserEmailListView

urlpatterns = [
    path('', EmailListView.as_view()),
    path('userspecific/<int:pk>/', UserEmailListView.as_view()),
    path('<int:pk>/', EmailDetailView.as_view()),
]
