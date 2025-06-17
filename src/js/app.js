import { showScreen } from './utils/ui.js';
import { switchAuthTab, handleLogin, handleRegister, handleLogout } from './auth.js';
import { handleAddContact } from './contacts.js';
import { handleSendMessage } from './messages.js';
import { handleCreateGroup, showGroupMembersList } from './groups.js';
import { setupMediaHandlers } from './media.js';
import { showModal, hideModal, clearForms } from './utils/ui.js';

export function initializeApp() {
    checkAuthStatus();
    setupEventListeners();
    setupMediaHandlers();
}

function checkAuthStatus() {
    // Pour le déploiement, on commence toujours par l'écran d'auth
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
    document.getElementById('add-group-btn').addEventListener('click', () => {
        showGroupMembersList();
        showModal('add-group-modal');
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
    
    // Modal de groupe
    document.getElementById('add-group-form').addEventListener('submit', handleCreateGroup);
    document.getElementById('cancel-group').addEventListener('click', () => {
        hideModal('add-group-modal');
    });
}