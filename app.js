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