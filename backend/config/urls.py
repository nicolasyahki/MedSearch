from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """
    Vue racine affichant un message de bienvenue JSON et répertoriant les points d'entrée de l'API.
    """
    return JsonResponse({
        "app": "MedSearch Central API Server",
        "status": "online",
        "version": "1.0.0",
        "description": "Serveur central de synchronisation et d'authentification pour la PWA MedSearch.",
        "endpoints": {
            "admin_panel": "/admin/",
            "agent_register": "/api/agents/register/",
            "agent_login": "/api/agents/login/",
            "agent_profile": "/api/agents/profile/",
            "push_vapid_key": "/api/agents/push/vapid-key/",
            "push_subscribe": "/api/agents/push/subscribe/",
            "push_broadcast": "/api/agents/push/broadcast/",
            "consultations_sync": "/api/consultations/sync/"
        }
    }, json_dumps_params={'ensure_ascii': False, 'indent': 2})

# Points d'entrée principaux de l'API
urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/agents/', include('agents.urls')),
    path('api/consultations/', include('consultations.urls')),
]

