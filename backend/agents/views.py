from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Agent, PushSubscription
from .serializers import AgentSerializer, AgentProfileSerializer
from .push_service import broadcast_push_notification

def get_tokens_for_agent(agent):
    """
    Génère un couple de tokens JWT (Access & Refresh) pour un agent donné
    """
    refresh = RefreshToken.for_user(agent)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    """
    Endpoint d'inscription pour enregistrer un nouvel agent.
    Génère immédiatement des tokens JWT pour connecter l'utilisateur d'office.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AgentSerializer(data=request.data)
        if serializer.is_valid():
            agent = serializer.save()
            tokens = get_tokens_for_agent(agent)
            return Response({
                'message': 'Agent enregistré avec succès.',
                'agent': serializer.data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    Endpoint de connexion pour authentifier un agent via son email et code PIN.
    Retourne les tokens JWT si la combinaison est correcte.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        pin = request.data.get('pin')

        if not email or not pin:
            return Response(
                {'error': 'Veuillez renseigner à la fois votre adresse email et votre code PIN.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authentification via le backend Django standard (le PIN est vérifié par rapport au password hashé)
        agent = authenticate(email=email, password=pin)

        if agent is not None:
            if not agent.is_active:
                return Response(
                    {'error': 'Ce compte agent a été désactivé. Veuillez contacter un administrateur.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            tokens = get_tokens_for_agent(agent)
            serializer = AgentSerializer(agent)
            return Response({
                'message': 'Connexion réussie.',
                'agent': serializer.data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Identifiants incorrects. Veuillez vérifier votre email ou votre code PIN.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class VapidPublicKeyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'publicKey': settings.VAPID_PUBLIC_KEY})


class PushSubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subscription = request.data
        keys = subscription.get('keys', {})

        if not subscription.get('endpoint') or not keys.get('p256dh') or not keys.get('auth'):
            return Response(
                {'error': 'Abonnement push invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PushSubscription.objects.update_or_create(
            agent=request.user,
            defaults={
                'endpoint': subscription['endpoint'],
                'p256dh': keys['p256dh'],
                'auth': keys['auth'],
                'subscription_json': subscription,
            },
        )

        return Response({'message': 'Abonnement push enregistré.'}, status=status.HTTP_200_OK)


class PushBroadcastView(APIView):
    """
    Diffusion d'alertes sanitaires aux agents (administration centrale).
    Filtre optionnel par zone géographique.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        title = request.data.get('title')
        body = request.data.get('body')
        zone = request.data.get('zone')
        url = request.data.get('url', '/')

        if not title or not body:
            return Response(
                {'error': 'Les champs title et body sont requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = broadcast_push_notification(title=title, body=body, zone=zone, url=url)
        return Response({
            'message': 'Notification diffusée.',
            'sent': result['sent'],
            'failures': result['failures'],
        })


class AgentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = AgentProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = AgentProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profil mis à jour.',
                'agent': serializer.data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
