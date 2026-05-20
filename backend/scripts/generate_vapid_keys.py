"""
Génère une paire de clés VAPID pour les notifications push Web.

Usage:
    python backend/scripts/generate_vapid_keys.py
"""
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
import base64


def generate_vapid_keys():
    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    public_numbers = private_key.public_key().public_numbers()

    x = public_numbers.x.to_bytes(32, 'big')
    y = public_numbers.y.to_bytes(32, 'big')
    public_key = base64.urlsafe_b64encode(b'\x04' + x + y).decode().rstrip('=')

    private_value = private_key.private_numbers().private_value.to_bytes(32, 'big')
    private_key_b64 = base64.urlsafe_b64encode(private_value).decode().rstrip('=')

    return public_key, private_key_b64


if __name__ == '__main__':
    pub, priv = generate_vapid_keys()
    print('VAPID_PUBLIC_KEY=' + pub)
    print('VAPID_PRIVATE_KEY=' + priv)
