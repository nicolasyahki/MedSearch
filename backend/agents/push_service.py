import json
from django.conf import settings
from pywebpush import webpush, WebPushException


def send_web_push(subscription_info, payload):
    return webpush(
        subscription_info=subscription_info,
        data=json.dumps(payload, ensure_ascii=False),
        vapid_private_key=settings.VAPID_PRIVATE_KEY,
        vapid_claims={
            'sub': settings.VAPID_ADMIN_EMAIL,
        },
    )


def broadcast_push_notification(*, title, body, zone=None, url='/'):
    from .models import PushSubscription

    payload = {
        'title': title,
        'body': body,
        'tag': 'medsearch-alert',
        'data': {'url': url},
    }

    queryset = PushSubscription.objects.select_related('agent')
    if zone:
        queryset = queryset.filter(agent__zone__icontains=zone)

    sent = 0
    failures = []

    for subscription in queryset:
        try:
            send_web_push(subscription.subscription_json, payload)
            sent += 1
        except WebPushException as exc:
            failures.append({'agent_id': subscription.agent_id, 'error': str(exc)})

    return {'sent': sent, 'failures': failures}
