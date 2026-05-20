from django.urls import path
from .views import SyncConsultationsView

# Routes de l'application Consultations
urlpatterns = [
    path('sync/', SyncConsultationsView.as_view(), name='consultations_sync'),
]
