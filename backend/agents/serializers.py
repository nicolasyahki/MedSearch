from rest_framework import serializers
from .models import Agent

class AgentSerializer(serializers.ModelSerializer):
    pin = serializers.CharField(
        write_only=True, 
        required=True, 
        min_length=4, 
        max_length=4,
        error_messages={
            'min_length': 'Le code PIN doit comporter exactement 4 chiffres.',
            'max_length': 'Le code PIN doit comporter exactement 4 chiffres.'
        }
    )

    class Meta:
        model = Agent
        fields = ['id', 'email', 'nom', 'prenom', 'zone', 'pin', 'date_creation']
        read_only_fields = ['id', 'date_creation']

    def validate_pin(self, value):
        # S'assurer que le PIN ne contient que des chiffres
        if not value.isdigit():
            raise serializers.ValidationError("Le code PIN doit être uniquement numérique.")
        return value

    def create(self, validated_data):
        # Création de l'agent via le manager pour hasher le PIN automatiquement
        pin = validated_data.pop('pin')
        agent = Agent.objects.create_user(
            email=validated_data['email'],
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            zone=validated_data['zone'],
            pin=pin
        )
        return agent


class AgentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'email', 'nom', 'prenom', 'zone', 'date_creation']
        read_only_fields = ['id', 'email', 'nom', 'prenom', 'date_creation']
