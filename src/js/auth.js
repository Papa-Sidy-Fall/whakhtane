import { registerUser, loginUser, findUserByPhone } from './api/users.js';
import { validateLoginForm, validateRegisterForm, sanitizeInput } from './validation.js';
import { displayErrors, clearErrors, showNotification, showScreen, clearForms } from './utils/ui.js';
import { setCurrentUser, setCurrentContact, setCurrentGroup, setContacts, messageRefreshInterval } from './state.js';
import { showMainInterface } from './interface.js';

export function switchAuthTab(tab) {
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

export async function handleLogin(e) {
    e.preventDefault();
    
    const phone = sanitizeInput(document.getElementById('login-phone').value);
    const errors = validateLoginForm(phone);
    
    if (!displayErrors(errors, 'login-errors')) {
        return;
    }
    
    try {
        const user = await loginUser(phone);
        setCurrentUser(user);
        showMainInterface();
    } catch (error) {
        displayErrors([error.message], 'login-errors');
    }
}

export async function handleRegister(e) {
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

export function handleLogout() {
    // Pas de localStorage à supprimer
    setCurrentUser(null);
    setCurrentContact(null);
    setCurrentGroup(null);
    setContacts([]);
    
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
    
    showScreen('auth-screen');
    clearForms();
    showNotification('Déconnexion réussie');
}