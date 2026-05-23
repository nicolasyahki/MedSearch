/**
 * Détecte l'exécution dans l'APK Capacitor (WebView Android).
 */
export function isCapacitorNative() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;
}
