// Remplacez par votre URL Render une fois déployé
const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://json-1gkz.onrender.com' 
    : 'http://localhost:3000';

// Fonctions API pour les utilisateurs
async function registerUser(userData) {
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

async function loginUser(phone) {
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

async function getUserById(userId) {
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

async function findUserByPhone(phone) {
    try {
        const response = await fetch(`${API_BASE}/users?phone=${phone}`);
        const users = await response.json();
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        throw new Error('Erreur lors de la recherche');
    }
}

async function updateUserContacts(userId, contacts) {
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

// Fonctions API pour les messages
async function sendMessage(messageData) {
    try {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...messageData,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Erreur d\'envoi du message');
    }
}

async function getMessages(userId, contactId) {
    try {
        const response = await fetch(
            `${API_BASE}/messages?` +
            `_sort=timestamp&_order=asc&` +
            `(senderId=${userId}&receiverId=${contactId}|senderId=${contactId}&receiverId=${userId})`
        );
        
        let messages = await response.json();
        
        // Filtrer manuellement car json-server ne supporte pas les OR complexes
        messages = messages.filter(msg => 
            (msg.senderId === userId && msg.receiverId === contactId) ||
            (msg.senderId === contactId && msg.receiverId === userId)
        );
        
        return messages;
    } catch (error) {
        throw new Error('Erreur lors du chargement des messages');
    }
}

async function getAllMessagesForUser(userId) {
    try {
        const response = await fetch(
            `${API_BASE}/messages?` +
            `_sort=timestamp&_order=desc&` +
            `(senderId=${userId}|receiverId=${userId})`
        );
        
        let messages = await response.json();
        
        // Filtrer manuellement
        messages = messages.filter(msg => 
            msg.senderId === userId || msg.receiverId === userId
        );
        
        return messages;
    } catch (error) {
        throw new Error('Erreur lors du chargement des messages');
    }
}