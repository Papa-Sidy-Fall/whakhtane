import { sendMessage, getMessages, sendGroupMessage } from './api/messages.js';
import { getCurrentUser, getCurrentContact, getCurrentGroup } from './state.js';
import { validateMessage, sanitizeInput } from './validation.js';
import { showNotification, formatTime } from './utils/ui.js';
import { loadContacts } from './contacts.js';

export async function loadMessages() {
    const currentContact = getCurrentContact();
    const currentUser = getCurrentUser();
    
    if (!currentContact || !currentUser) return;
    
    try {
        const messages = await getMessages(currentUser.id, currentContact.id);
        updateMessagesContainer(messages, currentUser.id);
    } catch (error) {
        showNotification('Erreur lors du chargement des messages', 'error');
    }
}

export async function handleSendMessage() {
    const currentUser = getCurrentUser();
    const currentContact = getCurrentContact();
    const currentGroup = getCurrentGroup();
    
    const messageInput = document.getElementById('message-input');
    const content = sanitizeInput(messageInput.value);

    if (currentGroup) {
        await sendGroupMessage({
            senderId: currentUser.id,
            groupId: currentGroup.id,
            content
        });
        messageInput.value = '';
        const { afficherMessagesGroupe, afficherGroupesDansSidebar } = await import('./groups.js');
        await afficherMessagesGroupe(currentGroup.id);
        await afficherGroupesDansSidebar();
        return;
    }
    
    const errors = validateMessage(content);
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }
    
    if (!currentContact) {
        showNotification('Sélectionnez un contact', 'error');
        return;
    }
    
    try {
        const messageData = {
            senderId: currentUser.id,
            receiverId: currentContact.id,
            content: content
        };
        
        await sendMessage(messageData);
        messageInput.value = '';
        await loadMessages();
        await loadContacts();
    } catch (error) {
        showNotification('Erreur lors de l\'envoi du message', 'error');
    }
}

export function createMessageElement(message, currentUserId) {
    const messageDiv = document.createElement('div');
    const isSent = message.senderId === currentUserId;
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

    if (message.audio) {
        const audioElem = document.createElement('audio');
        audioElem.controls = true;

        function base64ToBlob(base64, mime) {
            const byteString = atob(base64.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mime });
        }
        
        const blob = base64ToBlob(message.audio, 'audio/wav');
        audioElem.src = URL.createObjectURL(blob);

        audioElem.onerror = () => {
            audioElem.replaceWith('Audio non lisible');
        };
        messageDiv.appendChild(audioElem);

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '⬇️';
        downloadBtn.onclick = () => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vocal.wav';
            a.click();
        };
        messageDiv.appendChild(downloadBtn);
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(new Date(message.timestamp))}</div>
        `;
    }

    if (message.image) {
        const imgElem = document.createElement('img');
        imgElem.src = message.image;
        imgElem.alt = "Image envoyée";
        imgElem.style.maxWidth = "200px";
        imgElem.style.borderRadius = "8px";
        messageDiv.appendChild(imgElem);
    }

    if (message.video) {
        const videoElem = document.createElement('video');
        videoElem.src = message.video;
        videoElem.controls = true;
        videoElem.style.maxWidth = "250px";
        videoElem.style.borderRadius = "8px";
        messageDiv.appendChild(videoElem);
    }

    return messageDiv;
}

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