import os
from pathlib import Path
from datetime import timedelta

# Chemins de base du projet
BASE_DIR = Path(__file__).resolve().parent.parent

# Paramètres de sécurité (Dev)
SECRET_KEY = 'django-insecure-medsearch-secret-key-phase5-development'
DEBUG = True
ALLOWED_HOSTS = ['*']

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Librairies tierces
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    
    # Applications du projet
    'agents',
    'consultations',
]

# Middlewares (CORS doit être placé le plus haut possible)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Base de données SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuration du modèle Utilisateur personnalisé pour les Agents
AUTH_USER_MODEL = 'agents.Agent'

# Validation des mots de passe (PIN)
AUTH_PASSWORD_VALIDATORS = []

# Internationalisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

# Fichiers statiques
STATIC_URL = 'static/'

# Type de champ de clé primaire par défaut
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuration CORS pour autoriser le frontend Vite (y compris sur mobile via réseau local)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Configuration Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Configuration Simple JWT (Token d'accès longue durée pour le terrain hors-ligne)
# Clés VAPID pour les notifications push Web (dev — remplacer en production)
VAPID_PUBLIC_KEY = os.environ.get(
    'VAPID_PUBLIC_KEY',
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib27-SlS8Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8Yj2Z8',
)
VAPID_PRIVATE_KEY = os.environ.get(
    'VAPID_PRIVATE_KEY',
    'p256dh-dev-private-key-replace-in-production',
)
VAPID_ADMIN_EMAIL = os.environ.get('VAPID_ADMIN_EMAIL', 'mailto:admin@medsearch.org')

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
