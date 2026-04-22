const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Impossible de joindre le serveur SLAquent.',
  ROOM_ACCESS_DENIED: 'Cette conversation ne vous est pas accessible.',
  SELF_CHAT_FORBIDDEN: 'Vous ne pouvez pas vous écrire à vous-même.',
  SERVER_URL_MISSING: 'Configure EXPO_PUBLIC_SERVER_URL pour connecter l’application au backend.',
  SOCKET_NOT_CONNECTED: 'Le chat temps réel n’est pas connecté.',
  SOCKET_SESSION_FAILED: 'La session temps réel n’a pas pu être enregistrée.',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue.',
  USERNAME_REQUIRED: 'Entrez un nom d’utilisateur avant de continuer.',
  USER_NOT_FOUND: 'Utilisateur introuvable.',
};

export class AppError extends Error {
  code: string;

  constructor(code: string, message?: string) {
    super(message ?? ERROR_MESSAGES[code] ?? code);
    this.code = code;
    this.name = 'AppError';
  }
}

export function getErrorMessageFromUnknown(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue.'
) {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message.trim();
    return ERROR_MESSAGES[normalizedMessage] ?? (normalizedMessage || fallback);
  }

  return fallback;
}
