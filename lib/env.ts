const rawServerUrl = process.env.EXPO_PUBLIC_SERVER_URL?.trim() ?? '';

export const SERVER_URL = rawServerUrl.replace(/\/+$/, '');
export const API_BASE_URL = SERVER_URL ? `${SERVER_URL}/api` : '';
export const SERVER_CONFIG_ERROR = SERVER_URL
  ? null
  : 'Configure EXPO_PUBLIC_SERVER_URL pour connecter l’application au backend.';
