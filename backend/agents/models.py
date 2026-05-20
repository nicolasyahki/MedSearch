from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class AgentManager(BaseUserManager):
    """
    Gestionnaire personnalisé pour l'enregistrement et la gestion des agents de santé
    """
    def create_user(self, email, nom, prenom, zone, pin, **extra_fields):
        if not email:
            raise ValueError("L'adresse email doit être fournie")
        email = self.normalize_email(email)
        user = self.model(email=email, nom=nom, prenom=prenom, zone=zone, **extra_fields)
        # On utilise le système intégré de Django pour hasher le PIN de manière robuste
        user.set_password(pin)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nom, prenom, zone, pin, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, nom, prenom, zone, pin, **extra_fields)

class Agent(AbstractBaseUser):
    """
    Modèle de données principal pour les agents de santé (utilisateurs de l'app)
    """
    email = models.EmailField(unique=True, verbose_name="Adresse Email")
    nom = models.CharField(max_length=100, verbose_name="Nom de famille")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    zone = models.CharField(max_length=150, verbose_name="Zone géographique d'intervention")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date d'enregistrement")
    
    # Statuts système
    is_active = models.BooleanField(default=True, verbose_name="Compte actif")
    is_staff = models.BooleanField(default=False, verbose_name="Accès admin")

    objects = AgentManager()

    # Le champ d'authentification principal reste l'email pour le standard Django/JWT
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'zone']

    class Meta:
        verbose_name = "Agent de Santé"
        verbose_name_plural = "Agents de Santé"

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.zone})"


class PushSubscription(models.Model):
    agent = models.OneToOneField(
        Agent,
        on_delete=models.CASCADE,
        related_name='push_subscription',
        verbose_name="Agent abonné",
    )
    endpoint = models.TextField(verbose_name="Endpoint push")
    p256dh = models.CharField(max_length=255, verbose_name="Clé p256dh")
    auth = models.CharField(max_length=255, verbose_name="Secret auth")
    subscription_json = models.JSONField(verbose_name="Payload d'abonnement complet")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Abonnement Push"
        verbose_name_plural = "Abonnements Push"

    def __str__(self):
        return f"Push → {self.agent.email}"
