// // Fonctions d'interface utilisateur
// function showScreen(screenId) {
//     document.querySelectorAll('.screen').forEach(screen => {
//         screen.classList.remove('active');
//     });
//     document.getElementById(screenId).classList.add('active');
// }

// function showNotification(message, type = 'success') {
//     const container = document.getElementById('notification-container');
//     const notification = document.createElement('div');
    
//     notification.className = `notification ${type}`;
//     notification.textContent = message;
    
//     container.appendChild(notification);
    
//     setTimeout(() => {
//         notification.remove();
//     }, 4000);
// }

// function showModal(modalId) {
//     document.getElementById(modalId).classList.add('active');
// }

// function hideModal(modalId) {
//     document.getElementById(modalId).classList.remove('active');
// }

// function updateUserInfo(user) {
//     const userNameElement = document.getElementById('user-name');
//     const userAvatar = document.querySelector('.user-avatar');
    
//     userNameElement.textContent = `${user.firstname} ${user.lastname}`;
//     userAvatar.textContent = user.firstname.charAt(0).toUpperCase();
// }

// function createContactElement(contact, isActive = false) {
//     const contactDiv = document.createElement('div');
//     contactDiv.className = `contact-item ${isActive ? 'active' : ''}`;
//     contactDiv.dataset.contactId = contact.id;
    
//     const lastMessage = contact.lastMessage || 'Aucun message';
//     const time = contact.lastMessageTime ? 
//         formatTime(new Date(contact.lastMessageTime)) : '';
    
//     contactDiv.innerHTML = `
//         <div class="contact-avatar">
//             ${contact.firstname.charAt(0).toUpperCase()}
//         </div>
//         <div class="contact-info">
//             <h4>${contact.firstname} ${contact.lastname}</h4>
//             <p>${lastMessage}</p>
//         </div>
//         <div class="contact-time">
//             ${time}
//         </div>
//     `;
    
//     return contactDiv;
// }

// function updateContactsList(contacts) {
//     const contactsList = document.getElementById('contacts-list');
//     contactsList.innerHTML = '';
    
//     if (contacts.length === 0) {
//         const emptyMessage = document.createElement('div');
//         emptyMessage.style.padding = '20px';
//         emptyMessage.style.textAlign = 'center';
//         emptyMessage.style.color = '#8696a0';
//         emptyMessage.textContent = 'Aucun contact. Cliquez sur + pour ajouter un contact.';
//         contactsList.appendChild(emptyMessage);
//         return;
//     }
    
//     contacts.forEach(contact => {
//         const contactElement = createContactElement(contact);
//         contactsList.appendChild(contactElement);
//     });
// }

// function createMessageElement(message, currentUserId) {
//     const messageDiv = document.createElement('div');
//     const isSent = message.senderId === currentUserId;
    
//     messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
//     messageDiv.innerHTML = `
//         <div class="message-content">${message.content}</div>
//         <div class="message-time">${formatTime(new Date(message.timestamp))}</div>
//     `;
    
//     return messageDiv;
// }

// function updateMessagesContainer(messages, currentUserId) {
//     const container = document.getElementById('messages-container');
//     container.innerHTML = '';
    
//     if (messages.length === 0) {
//         const emptyMessage = document.createElement('div');
//         emptyMessage.className = 'no-chat-selected';
//         emptyMessage.innerHTML = '<p>Aucun message. Commencez la conversation !</p>';
//         container.appendChild(emptyMessage);
//         return;
//     }
    
//     messages.forEach(message => {
//         const messageElement = createMessageElement(message, currentUserId);
//         container.appendChild(messageElement);
//     });
    
//     // Scroll vers le bas
//     container.scrollTop = container.scrollHeight;
// }

// function updateChatHeader(contact) {
//     const chatHeader = document.getElementById('chat-header');
//     const messageInputContainer = document.getElementById('message-input-container');
    
//     if (contact) {
//         chatHeader.innerHTML = `
//             <div style="display: flex; align-items: center; gap: 15px;">
//                 <div class="contact-avatar" style="width: 40px; height: 40px;">
//                     ${contact.firstname.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                     <h4>${contact.firstname} ${contact.lastname}</h4>
//                     <p style="font-size: 13px; color: #8696a0; font-weight: normal;">
//                         ${contact.phone}
//                     </p>
//                 </div>
//             </div>
//         `;
//         messageInputContainer.style.display = 'block';
//     } else {
//         chatHeader.textContent = 'Sélectionnez une conversation';
//         messageInputContainer.style.display = 'none';
//     }
// }

// function setActiveContact(contactId) {
//     document.querySelectorAll('.contact-item').forEach(item => {
//         item.classList.remove('active');
//     });
    
//     const activeContact = document.querySelector(`[data-contact-id="${contactId}"]`);
//     if (activeContact) {
//         activeContact.classList.add('active');
//     }
// }

// function formatTime(date) {
//     const now = new Date();
//     const messageDate = new Date(date);
    
//     if (messageDate.toDateString() === now.toDateString()) {
//         return messageDate.toLocaleTimeString('fr-FR', { 
//             hour: '2-digit', 
//             minute: '2-digit' 
//         });
//     } else {
//         return messageDate.toLocaleDateString('fr-FR', { 
//             day: '2-digit', 
//             month: '2-digit' 
//         });
//     }
// }

// function clearForms() {
//     document.querySelectorAll('form').forEach(form => {
//         form.reset();
//     });
    
//     document.querySelectorAll('.error-container').forEach(container => {
//         container.innerHTML = '';
//     });
// }

// function scrollToBottom(containerId) {
//     const container = document.getElementById(containerId);
//     container.scrollTop = container.scrollHeight;
// }