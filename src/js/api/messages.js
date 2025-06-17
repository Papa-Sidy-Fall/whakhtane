import { API_BASE } from '../config.js';

// Fonctions API pour les messages
export async function sendMessage(messageData) {
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

export async function sendGroupMessage(messageData) {
    const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...messageData,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        })
    });
    if (!response.ok) throw new Error('Erreur envoi message groupe');
    return await response.json();
}

export async function getMessages(userId, contactId) {
    try {
        const response = await fetch(
            `${API_BASE}/messages?_sort=timestamp&_order=asc`
        );
        let messages = await response.json();

        // Filtrer les messages entre userId et contactId
        messages = messages.filter(msg =>
            (msg.senderId === userId && msg.receiverId === contactId) ||
            (msg.senderId === contactId && msg.receiverId === userId)
        );

        return messages;
    } catch (error) {
        throw new Error('Erreur lors du chargement des messages');
    }
}

export async function getAllMessagesForUser(userId) {
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

export async function loadGroupMessages(groupId) {
    const response = await fetch(`${API_BASE}/messages?groupId=${groupId}&_sort=timestamp&_order=asc`);
    return await response.json();
}