from django.urls import path
from .views import RegisterView, LoginView, VapidPublicKeyView, PushSubscribeView, PushBroadcastView, AgentProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='agent_register'),
    path('login/', LoginView.as_view(), name='agent_login'),
    path('profile/', AgentProfileView.as_view(), name='agent_profile'),
    path('push/vapid-key/', VapidPublicKeyView.as_view(), name='push_vapid_key'),
    path('push/subscribe/', PushSubscribeView.as_view(), name='push_subscribe'),
    path('push/broadcast/', PushBroadcastView.as_view(), name='push_broadcast'),
]
