from rest_framework import serializers
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = [
            'id',
            'agent',
            'client_uuid',
            'nom_patient',
            'age_patient',
            'sexe_patient',
            'poids_patient',
            'zone',
            'symptomes_saisis',
            'diagnostic_retenu',
            'score_diagnostic',
            'signes_danger',
            'date_consultation',
            'updated_at_client',
            'version',
            'synced_at',
        ]
        read_only_fields = ['id', 'agent', 'synced_at']
