import { createGroup, loadGroups } from './api/groups.js';
import { loadGroupMessages } from './api/messages.js';
import { currentUser, contacts, setCurrentContact, setCurrentGroup } from './state.js';
import { showNotification, hideModal } from './utils/ui.js';

export async function afficherGroupesDansSidebar() {
    if (!currentUser) return;
    const allGroups = await loadGroups();
    const groups = allGroups.filter(g => g.members.includes(String(currentUser.id)));
    const groupsList = document.getElementById('groups-list');
    groupsList.innerHTML = '';
    
    groups.forEach(group => {
        const div = document.createElement('div');
        div.className = 'group-item';
        div.textContent = group.name;
        div.dataset.groupId = group.id;
        div.onclick = async () => {
            setCurrentContact(null);
            setCurrentGroup(group);
            setActiveGroup(group.id);
            await afficherMessagesGroupe(group.id);
            // Import dynamique pour éviter les dépendances circulaires
            const { updateGroupHeader } = await import('./interface.js');
            updateGroupHeader(group);
            document.getElementById('message-input-container').style.display = 'block';
        };
        groupsList.appendChild(div);
    });
}

export async function afficherMessagesGroupe(groupId) {
    const messages = await loadGroupMessages(groupId);
    const { updateMessagesContainer } = await import('./interface.js');
    updateMessagesContainer(messages, currentUser.id);
}

export function showGroupMembersList() {
    const container = document.getElementById('group-members-list');
    container.innerHTML = '';
    contacts.forEach(contact => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label>
                <input type="checkbox" value="${contact.id}">
                ${contact.firstname} ${contact.lastname}
            </label>
        `;
        container.appendChild(div);
    });
}

export async function handleCreateGroup(e) {
    e.preventDefault();
    const name = document.getElementById('group-name').value.trim();
    const checked = Array.from(document.querySelectorAll('#group-members-list input[type="checkbox"]:checked'));
    const memberIds = checked.map(cb => cb.value);
    
    if (!memberIds.includes(currentUser.id)) memberIds.push(currentUser.id);

    if (!name || memberIds.length < 2) {
        showNotification('Nom du groupe et au moins 2 membres requis', 'error');
        return;
    }
    
    try {
        await createGroup(name, memberIds);
        hideModal('add-group-modal');
        showNotification('Groupe créé !');
        await afficherGroupesDansSidebar();
    } catch (err) {
        showNotification('Erreur lors de la création du groupe', 'error');
    }
}

export function setActiveGroup(groupId) {
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeGroup = Array.from(document.querySelectorAll('.group-item'))
        .find(item => item.dataset.groupId === groupId);
    if (activeGroup) {
        activeGroup.classList.add('active');
    }
}