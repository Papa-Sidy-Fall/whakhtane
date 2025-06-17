// Configuration de l'API
export const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://json-1gkz.onrender.com'
    : 'http://localhost:3000';