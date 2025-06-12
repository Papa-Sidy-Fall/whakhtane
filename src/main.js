import './index.css'
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
// Variables globales
let currentUser = null;
let currentContact = null;
let contacts = [];
let messageRefreshInterval = null;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    checkAuthStatus();
    setupEventListeners();
}

function checkAuthStatus() {
    // Pour le déploiement, on commence toujours par l'écran d'auth
    // localStorage ne permet pas la sync entre navigateurs
    showScreen('auth-screen');
}

function setupEventListeners() {
    // Onglets d'authentification
    document.getElementById('login-tab').addEventListener('click', () => {
        switchAuthTab('login');
    });
    
    document.getElementById('register-tab').addEventListener('click', () => {
        switchAuthTab('register');
    });
    
    // Formulaires d'authentification
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Actions principales
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('add-contact-btn').addEventListener('click', () => {
        showModal('add-contact-modal');
    });
    
    // Modal de contact
    document.getElementById('add-contact-form').addEventListener('submit', handleAddContact);
    document.getElementById('cancel-contact').addEventListener('click', () => {
        hideModal('add-contact-modal');
        clearForms();
    });
    
    // Envoi de message
    document.getElementById('send-btn').addEventListener('click', handleSendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
}

function switchAuthTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
    
    clearErrors('login-errors');
    clearErrors('register-errors');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const phone = sanitizeInput(document.getElementById('login-phone').value);
    const errors = validateLoginForm(phone);
    
    if (!displayErrors(errors, 'login-errors')) {
        return;
    }
    
    try {
        const user = await loginUser(phone);
        currentUser = user;
        // Pas de localStorage pour éviter les conflits entre navigateurs
        showNotification('Connexion réussie !');
        showMainInterface();
    } catch (error) {
        displayErrors([error.message], 'login-errors');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const firstname = sanitizeInput(document.getElementById('register-firstname').value);
    const lastname = sanitizeInput(document.getElementById('register-lastname').value);
    const phone = sanitizeInput(document.getElementById('register-phone').value);
    
    const errors = validateRegisterForm(firstname, lastname, phone);
    
    if (!displayErrors(errors, 'register-errors')) {
        return;
    }
    
    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await findUserByPhone(phone);
        if (existingUser) {
            displayErrors(['Ce numéro de téléphone est déjà utilisé'], 'register-errors');
            return;
        }
        
        const userData = { firstname, lastname, phone };
        const user = await registerUser(userData);
        
        showNotification('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        switchAuthTab('login');
        document.getElementById('login-phone').value = phone;
    } catch (error) {
        displayErrors([error.message], 'register-errors');
    }
}

function handleLogout() {
    // Pas de localStorage à supprimer
    currentUser = null;
    currentContact = null;
    contacts = [];
    
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    
    showScreen('auth-screen');
    clearForms();
    showNotification('Déconnexion réussie');
}

async function showMainInterface() {
    updateUserInfo(currentUser);
    showScreen('main-screen');
    await loadContacts();
    startMessageRefresh();
}

async function loadContacts() {
    try {
        const user = await getUserById(currentUser.id);
        const contactsData = [];
        
        for (const contactId of user.contacts || []) {
            try {
                const contact = await getUserById(contactId);
                const messages = await getAllMessagesForUser(currentUser.id);
                
                // Trouver le dernier message avec ce contact
                const contactMessages = messages.filter(msg => 
                    (msg.senderId === currentUser.id && msg.receiverId === contact.id) ||
                    (msg.senderId === contact.id && msg.receiverId === currentUser.id)
                );
                
                if (contactMessages.length > 0) {
                    const lastMsg = contactMessages[0];
                    contact.lastMessage = lastMsg.content.substring(0, 30) + '...';
                    contact.lastMessageTime = lastMsg.timestamp;
                }
                
                contactsData.push(contact);
            } catch (error) {
                console.error('Erreur chargement contact:', error);
            }
        }
        
        // Trier par dernier message
        contactsData.sort((a, b) => {
            if (!a.lastMessageTime && !b.lastMessageTime) return 0;
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });
        
        contacts = contactsData;
        updateContactsList(contacts);
        setupContactClickListeners();
    } catch (error) {
        showNotification('Erreur lors du chargement des contacts', 'error');
    }
}

function setupContactClickListeners() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', async () => {
            const contactId = item.dataset.contactId;
            const contact = contacts.find(c => c.id === contactId);
            
            if (contact) {
                currentContact = contact;
                setActiveContact(contactId);
                updateChatHeader(contact);
                await loadMessages();
            }
        });
    });
}

async function handleAddContact(e) {
    e.preventDefault();
    
    const phone = sanitizeInput(document.getElementById('contact-phone').value);
    const errors = validateContactForm(phone);
    
    if (!displayErrors(errors, 'contact-errors')) {
        return;
    }
    
    if (phone === currentUser.phone) {
        displayErrors(['Vous ne pouvez pas vous ajouter vous-même'], 'contact-errors');
        return;
    }
    
    try {
        const contact = await findUserByPhone(phone);
        if (!contact) {
            displayErrors(['Aucun utilisateur trouvé avec ce numéro'], 'contact-errors');
            return;
        }
        
        const user = await getUserById(currentUser.id);
        const userContacts = user.contacts || [];
        
        if (userContacts.includes(contact.id)) {
            displayErrors(['Ce contact existe déjà'], 'contact-errors');
            return;
        }
        
        userContacts.push(contact.id);
        await updateUserContacts(currentUser.id, userContacts);
        
        hideModal('add-contact-modal');
        clearForms();
        showNotification('Contact ajouté avec succès !');
        await loadContacts();
    } catch (error) {
        displayErrors([error.message], 'contact-errors');
    }
}

async function loadMessages() {
    if (!currentContact) return;
    
    try {
        const messages = await getMessages(currentUser.id, currentContact.id);
        updateMessagesContainer(messages, currentUser.id);
    } catch (error) {
        showNotification('Erreur lors du chargement des messages', 'error');
    }
}

async function handleSendMessage() {
    if (!currentContact) return;
    
    const messageInput = document.getElementById('message-input');
    const content = sanitizeInput(messageInput.value);
    
    const errors = validateMessage(content);
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
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
        await loadContacts(); // Rafraîchir la liste pour mettre à jour le dernier message
    } catch (error) {
        showNotification('Erreur lors de l\'envoi du message', 'error');
    }
}

function startMessageRefresh() {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    
    messageRefreshInterval = setInterval(async () => {
        if (currentContact) {
            await loadMessages();
        }
        await loadContacts();
    }, 3000); // Rafraîchir toutes les 3 secondes
}
// Fonctions d'interface utilisateur
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updateUserInfo(user) {
    const userNameElement = document.getElementById('user-name');
    const userAvatar = document.querySelector('.user-avatar');
    
    userNameElement.textContent = `${user.firstname} ${user.lastname}`;
    userAvatar.textContent = user.firstname.charAt(0).toUpperCase();
}

function createContactElement(contact, isActive = false) {
    const contactDiv = document.createElement('div');
    contactDiv.className = `contact-item ${isActive ? 'active' : ''}`;
    contactDiv.dataset.contactId = contact.id;
    
    const lastMessage = contact.lastMessage || 'Aucun message';
    const time = contact.lastMessageTime ? 
        formatTime(new Date(contact.lastMessageTime)) : '';
    
    contactDiv.innerHTML = `
        <div class="contact-avatar">
            ${contact.firstname.charAt(0).toUpperCase()}
        </div>
        <div class="contact-info">
            <h4>${contact.firstname} ${contact.lastname}</h4>
            <p>${lastMessage}</p>
        </div>
        <div class="contact-time">
            ${time}
        </div>
    `;
    
    return contactDiv;
}

function updateContactsList(contacts) {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';
    
    if (contacts.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.padding = '20px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#8696a0';
        emptyMessage.textContent = 'Aucun contact. Cliquez sur + pour ajouter un contact.';
        contactsList.appendChild(emptyMessage);
        return;
    }
    
    contacts.forEach(contact => {
        const contactElement = createContactElement(contact);
        contactsList.appendChild(contactElement);
    });
}

function createMessageElement(message, currentUserId) {
    const messageDiv = document.createElement('div');
    const isSent = message.senderId === currentUserId;
    
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${formatTime(new Date(message.timestamp))}</div>
    `;
    
    return messageDiv;
}

function updateMessagesContainer(messages, currentUserId) {
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
    
    // Scroll vers le bas
    container.scrollTop = container.scrollHeight;
}

function updateChatHeader(contact) {
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

function setActiveContact(contactId) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeContact = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (activeContact) {
        activeContact.classList.add('active');
    }
}

function formatTime(date) {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === now.toDateString()) {
        return messageDate.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    } else {
        return messageDate.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }
}

function clearForms() {
    document.querySelectorAll('form').forEach(form => {
        form.reset();
    });
    
    document.querySelectorAll('.error-container').forEach(container => {
        container.innerHTML = '';
    });
}

function scrollToBottom(containerId) {
    const container = document.getElementById(containerId);
    container.scrollTop = container.scrollHeight;
}
// Fonctions de validation
function validatePhone(phone) {
    const phoneRegex = /^[+]?[0-9]{8,15}$/;
    const errors = [];
    
    if (!phone || phone.trim() === '') {
        errors.push('Le numéro de téléphone est requis');
    } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        errors.push('Le numéro de téléphone doit contenir entre 8 et 15 chiffres');
    }
    
    return errors;
}

function validateName(name, fieldName) {
    const errors = [];
    
    if (!name || name.trim() === '') {
        errors.push(`${fieldName} est requis`);
    } else if (name.trim().length < 2) {
        errors.push(`${fieldName} doit contenir au moins 2 caractères`);
    } else if (name.trim().length > 50) {
        errors.push(`${fieldName} ne peut pas dépasser 50 caractères`);
    } else if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(name.trim())) {
        errors.push(`${fieldName} ne peut contenir que des lettres, espaces et tirets`);
    }
    
    return errors;
}

function validateMessage(message) {
    const errors = [];
    
    if (!message || message.trim() === '') {
        errors.push('Le message ne peut pas être vide');
    } else if (message.trim().length > 1000) {
        errors.push('Le message ne peut pas dépasser 1000 caractères');
    }
    
    return errors;
}

function validateLoginForm(phone) {
    return validatePhone(phone);
}

function validateRegisterForm(firstname, lastname, phone) {
    const errors = [];
    
    errors.push(...validateName(firstname, 'Le prénom'));
    errors.push(...validateName(lastname, 'Le nom'));
    errors.push(...validatePhone(phone));
    
    return errors;
}

function validateContactForm(phone) {
    return validatePhone(phone);
}

function displayErrors(errors, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (errors.length > 0) {
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error;
            container.appendChild(errorDiv);
        });
        return false;
    }
    
    return true;
}

function clearErrors(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}