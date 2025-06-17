import { API_BASE } from '../config.js';

// Fonctions API pour les utilisateurs
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...userData,
                id: Date.now().toString(),
                contacts: [],
                createdAt: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'inscription');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Erreur de connexion au serveur');
    }
}

export async function loginUser(phone) {
    try {
        const response = await fetch(`${API_BASE}/users?phone=${phone}`);
        const users = await response.json();
        
        if (users.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }
        
        return users[0];
    } catch (error) {
        throw new Error('Erreur de connexion');
    }
}

export async function getUserById(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        if (!response.ok) {
            throw new Error('Utilisateur non trouvé');
        }
        return await response.json();
    } catch (error) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
}

export async function findUserByPhone(phone) {
    try {
        const response = await fetch(`${API_BASE}/users?phone=${phone}`);
        const users = await response.json();
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        throw new Error('Erreur lors de la recherche');
    }
}

export async function updateUserContacts(userId, contacts) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contacts })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Erreur de mise à jour');
    }
}