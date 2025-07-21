// Fichier de configuration centralisé
// Remplace les imports dispersés dans le projet

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
