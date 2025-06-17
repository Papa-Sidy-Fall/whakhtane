import { getCurrentUser, setMessageRefreshInterval, getMessageRefreshInterval, getCurrentContact } from './state.js';
import { showScreen } from './utils/ui.js';
import { loadContacts } from './contacts.js';
import { afficherGroupesDansSidebar } from './groups.js';
import { loadMessages } from './messages.js';
import { createMessageElement } from './messages.js';

export function updateMessagesContainer(messages, currentUserId) {
    const container = document.getElementById('messages-container');
    container.innerHTML = '';
    
    if (messages.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'no-chat-selected';
        emptyMessage.innerHTML = '<p>Aucun message. Commencez la conversation !</p>';
        container.appendChild(emptyMessage);
        return;
    }
    
    messages.forEach(message => {
        const messageElement = createMessageElement(message, currentUserId);
        container.appendChild(messageElement);
    });
    
    container.scrollTop = container.scrollHeight;
}

export function updateChatHeader(contact) {
    const chatHeader = document.getElementById('chat-header');
    const messageInputContainer = document.getElementById('message-input-container');
    
    if (contact) {
        chatHeader.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="contact-avatar" style="width: 40px; height: 40px;">
                    ${contact.firstname.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4>${contact.firstname} ${contact.lastname}</h4>
                    <p style="font-size: 13px; color: #8696a0; font-weight: normal;">
                        ${contact.phone}
                    </p>
                </div>
            </div>
        `;
        messageInputContainer.style.display = 'block';
    } else {
        chatHeader.textContent = 'Sélectionnez une conversation';
        messageInputContainer.style.display = 'none';
    }
}

export function updateGroupHeader(group) {
    const chatHeader = document.getElementById('chat-header');
    chatHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div class="contact-avatar" style="width: 40px; height: 40px; background:#00a884;">
                <i class="fa-solid fa-users"></i>
            </div>
            <div>
                <h4>${group.name}</h4>
                <p style="font-size: 13px; color: #8696a0; font-weight: normal;">
                    Groupe (${group.members.length} membres)
                </p>
            </div>
        </div>
    `;
}

export function updateUserInfo(user) {
    const userNameElement = document.getElementById('user-name');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userNameElement && userAvatar) {
        userNameElement.textContent = `${user.firstname} ${user.lastname}`;
        userAvatar.textContent = user.firstname.charAt(0).toUpperCase();
    }
}

export async function showMainInterface() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    updateUserInfo(currentUser);
    showScreen('main-screen');
    await loadContacts();
    
    const { afficherGroupesDansSidebar } = await import('./groups.js');
    await afficherGroupesDansSidebar();
    startMessageRefresh();
}

export function startMessageRefresh() {
    const messageRefreshInterval = getMessageRefreshInterval();
    
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    
    const interval = setInterval(async () => {
        const currentUser = getCurrentUser();
        const currentContact = getCurrentContact();
        
        if (!currentUser) return;
        if (currentContact) {
            await loadMessages();
        }
        await loadContacts();
        
        const { afficherGroupesDansSidebar } = await import('./groups.js');
        await afficherGroupesDansSidebar();
    }, 3000);
    
    setMessageRefreshInterval(interval);
}