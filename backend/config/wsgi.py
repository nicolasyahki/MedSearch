import os
from django.core.wsgi import get_wsgi_application

# Définition des variables d'environnement pour charger les paramètres
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Instanciation de l'application WSGI globale
application = get_wsgi_application()
