import { getUserById, findUserByPhone, updateUserContacts } from './api/users.js';
import { getAllMessagesForUser } from './api/messages.js';
import { getCurrentUser, setContacts, getContacts, setCurrentContact } from './state.js';
import { validateContactForm, sanitizeInput } from './validation.js';
import { displayErrors, showNotification, hideModal, clearForms, formatTime } from './utils/ui.js';
import { updateChatHeader, loadMessages } from './messages.js';

export async function loadContacts() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
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
        
        setContacts(contactsData);
        updateContactsList(contactsData);
        setupContactClickListeners();
    } catch (error) {
        showNotification('Erreur lors du chargement des contacts', 'error');
    }
}

export function createContactElement(contact, isActive = false) {
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

export function updateContactsList(contacts) {
    const contactsList = document.getElementById('contacts-list');
    if (!contactsList) return;
    
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

export function setupContactClickListeners() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('click', async () => {
            const contactId = item.dataset.contactId;
            const contacts = getContacts();
            const contact = contacts.find(c => c.id === contactId);
            
            if (contact) {
                setCurrentContact(contact);
                setActiveContact(contactId);
                updateChatHeader(contact);
                await loadMessages();
            }
        });
    });
}

export async function handleAddContact(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
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

export function setActiveContact(contactId) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeContact = document.querySelector(`[data-contact-id="${contactId}"]`);
    if (activeContact) {
        activeContact.classList.add('active');
    }
}