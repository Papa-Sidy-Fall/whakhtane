import { API_BASE } from '../config.js';

export async function createGroup(name, memberIds) {
    const response = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: Date.now().toString(),
            name,
            members: memberIds,
            createdAt: new Date().toISOString()
        })
    });
    if (!response.ok) throw new Error('Erreur création groupe');
    return await response.json();
}

export async function updateGroupMembers(groupId, members) {
    const response = await fetch(`${API_BASE}/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members })
    });
    if (!response.ok) throw new Error('Erreur mise à jour membres');
    return await response.json();
}

export async function loadGroups() {
    const response = await fetch(`${API_BASE}/groups`);
    return await response.json();
}