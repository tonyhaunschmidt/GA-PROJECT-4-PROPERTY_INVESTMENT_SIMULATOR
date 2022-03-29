from django.urls import path
from .views import LettingDetailView, LettingListView, UserLettingsListView, propertyLettingsListView

urlpatterns = [
    path('', LettingListView.as_view()),
    path('<int:pk>/', LettingDetailView.as_view()),
    path('propertyspecific/<int:pk>/', propertyLettingsListView.as_view()),
    path('userspecific/<int:pk>/', UserLettingsListView.as_view()),
]
