const BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

export const syncService = {
  apiBaseUrl: BASE_URL,

  register: async (agentData) => {
    const response = await fetch(`${BASE_URL}/agents/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: agentData.email,
        nom: agentData.nom,
        prenom: agentData.prenom,
        zone: agentData.zone,
        pin: agentData.pin,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = data.email
        ? 'Cet email est déjà enregistré.'
        : (data.error || "Échec de l'inscription serveur.");
      throw new Error(errorMessage);
    }

    return data;
  },

  login: async (email, pin) => {
    const response = await fetch(`${BASE_URL}/agents/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Email ou code PIN serveur incorrect.');
    }

    return data;
  },

  syncConsultations: async (consultations, token) => {
    if (!token) {
      throw new Error("Token d'authentification manquant.");
    }

    const response = await fetch(`${BASE_URL}/consultations/sync/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(consultations),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Erreur de synchronisation réseau.');
    }

    return data;
  },

  getVapidPublicKey: async () => {
    const response = await fetch(`${BASE_URL}/agents/push/vapid-key/`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Impossible de récupérer la clé push.');
    }
    return data.publicKey;
  },

  subscribePush: async (subscription, token) => {
    const response = await fetch(`${BASE_URL}/agents/push/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Échec de l'abonnement push.");
    }

    return data;
  },

  updateProfile: async (profileData, token) => {
    const response = await fetch(`${BASE_URL}/agents/profile/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Échec de la mise à jour du profil.');
    }

    return data;
  },
};

export default syncService;
