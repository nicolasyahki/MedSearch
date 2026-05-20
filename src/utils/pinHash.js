import { sha256 } from 'js-sha256';

/**
 * Hash SHA-256 du PIN, compatible HTTP (réseau local) et HTTPS.
 * crypto.subtle n'est pas disponible hors contexte sécurisé (ex. http://192.168.x.x).
 */
export function hashPin(pin) {
  return sha256(pin);
}
