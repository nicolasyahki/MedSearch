from django.db import models
from django.conf import settings
from django.utils import timezone


class Consultation(models.Model):
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='consultations',
        verbose_name="Agent de santé référent",
    )

    client_uuid = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        db_index=True,
        verbose_name="Identifiant client (UUID)",
    )

    nom_patient = models.CharField(max_length=150, verbose_name="Nom/Référence du patient")
    age_patient = models.PositiveIntegerField(verbose_name="Âge du patient")
    sexe_patient = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name="Sexe du patient")
    poids_patient = models.FloatField(null=True, blank=True, verbose_name="Poids du patient (kg)")
    zone = models.CharField(max_length=150, verbose_name="Zone géographique")

    symptomes_saisis = models.TextField(verbose_name="Symptômes saisis")
    diagnostic_retenu = models.CharField(max_length=200, verbose_name="Diagnostic retenu/Maladie")
    score_diagnostic = models.PositiveIntegerField(default=0, verbose_name="Score de certitude (%)")
    signes_danger = models.TextField(blank=True, verbose_name="Signes de danger critiques détectés")

    date_consultation = models.DateTimeField(verbose_name="Date et heure de la consultation locale")
    updated_at_client = models.DateTimeField(null=True, blank=True, verbose_name="Dernière modification client")
    version = models.PositiveIntegerField(default=1, verbose_name="Version de la fiche")

    synced_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de synchronisation serveur")

    class Meta:
        verbose_name = "Consultation Médicale"
        verbose_name_plural = "Consultations Médicales"
        ordering = ['-date_consultation']
        constraints = [
            models.UniqueConstraint(
                fields=['agent', 'client_uuid'],
                condition=models.Q(client_uuid__isnull=False),
                name='unique_consultation_client_uuid_per_agent',
            )
        ]

    def __str__(self):
        return f"{self.nom_patient} - {self.diagnostic_retenu} ({self.date_consultation.strftime('%d/%m/%Y')})"

    def to_conflict_dict(self):
        return {
            'id': self.id,
            'client_uuid': self.client_uuid,
            'nom_patient': self.nom_patient,
            'age_patient': self.age_patient,
            'sexe_patient': self.sexe_patient,
            'poids_patient': self.poids_patient,
            'zone': self.zone,
            'symptomes_saisis': self.symptomes_saisis,
            'diagnostic_retenu': self.diagnostic_retenu,
            'score_diagnostic': self.score_diagnostic,
            'signes_danger': self.signes_danger,
            'date_consultation': self.date_consultation.isoformat(),
            'updated_at_client': self.updated_at_client.isoformat() if self.updated_at_client else None,
            'version': self.version,
        }
