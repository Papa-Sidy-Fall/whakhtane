// Fonctions utilitaires pour l'interface utilisateur
export function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

export function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

export function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

export function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

export function clearForms() {
    document.querySelectorAll('form').forEach(form => {
        form.reset();
    });
    
    document.querySelectorAll('.error-container').forEach(container => {
        container.innerHTML = '';
    });
}

export function scrollToBottom(containerId) {
    const container = document.getElementById(containerId);
    container.scrollTop = container.scrollHeight;
}

export function formatTime(date) {
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

export function displayErrors(errors, containerId) {
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

export function clearErrors(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}