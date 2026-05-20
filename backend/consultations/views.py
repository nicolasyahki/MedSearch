from django.utils.dateparse import parse_datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Consultation
from .serializers import ConsultationSerializer


def map_client_payload(item):
    return {
        'nom_patient': item.get('patientRef'),
        'age_patient': item.get('age'),
        'sexe_patient': item.get('sexe'),
        'poids_patient': item.get('poids'),
        'zone': item.get('zone'),
        'symptomes_saisis': item.get('symptomes'),
        'diagnostic_retenu': item.get('diagnosticId') or 'Aucun diagnostic spécifique',
        'score_diagnostic': item.get('score', 0),
        'signes_danger': item.get('signesDanger') or 'Aucun',
        'date_consultation': item.get('date'),
        'updated_at_client': item.get('updatedAt') or item.get('date'),
        'version': item.get('version', 1),
        'client_uuid': item.get('clientUuid'),
    }


def parse_client_datetime(value):
    if not value:
        return None
    parsed = parse_datetime(value)
    if parsed is None and isinstance(value, str):
        parsed = parse_datetime(value.replace('Z', '+00:00'))
    return parsed


class SyncConsultationsView(APIView):
    """
    Synchronisation par lots avec résolution Last-Write-Wins et escalade manuelle.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not isinstance(request.data, list):
            return Response(
                {'error': 'Les données de synchronisation doivent être envoyées sous forme de tableau JSON.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        synced_ids = []
        server_meta = {}
        conflicts = []
        errors = []

        for item in request.data:
            id_local = item.get('id')
            mapped_data = map_client_payload(item)
            client_uuid = mapped_data.get('client_uuid')
            client_updated_at = parse_client_datetime(mapped_data.get('updated_at_client'))

            if client_uuid:
                existing = Consultation.objects.filter(
                    agent=request.user,
                    client_uuid=client_uuid,
                ).first()

                if existing:
                    server_updated_at = existing.updated_at_client or existing.synced_at

                    if client_updated_at and server_updated_at and client_updated_at > server_updated_at:
                        serializer = ConsultationSerializer(existing, data=mapped_data, partial=True)
                        if serializer.is_valid():
                            serializer.save(agent=request.user)
                            synced_ids.append(id_local)
                            server_meta[str(id_local)] = {
                                'server_id': existing.id,
                                'version': existing.version,
                            }
                        else:
                            errors.append({'id_local': id_local, 'errors': serializer.errors})
                        continue

                    if client_updated_at and server_updated_at and client_updated_at < server_updated_at:
                        conflicts.append({
                            'id_local': id_local,
                            'client_uuid': client_uuid,
                            'resolution': 'manual_required',
                            'local_record': item,
                            'server_record': existing.to_conflict_dict(),
                        })
                        continue

                    synced_ids.append(id_local)
                    server_meta[str(id_local)] = {
                        'server_id': existing.id,
                        'version': existing.version,
                    }
                    continue

            serializer = ConsultationSerializer(data=mapped_data)
            if serializer.is_valid():
                consultation = serializer.save(agent=request.user)
                synced_ids.append(id_local)
                server_meta[str(id_local)] = {
                    'server_id': consultation.id,
                    'version': consultation.version,
                }
            else:
                errors.append({'id_local': id_local, 'errors': serializer.errors})

        response_data = {
            'status': 'success' if not errors and not conflicts else 'partial_success',
            'synced_ids': synced_ids,
            'server_meta': server_meta,
            'conflicts': conflicts,
        }

        if errors:
            response_data['errors'] = errors

        return Response(response_data, status=status.HTTP_200_OK)
