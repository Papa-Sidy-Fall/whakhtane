// Fonctions de validation
export function validatePhone(phone) {
    const phoneRegex = /^[+]?[0-9]{8,15}$/;
    const errors = [];
    
    if (!phone || phone.trim() === '') {
        errors.push('Le numéro de téléphone est requis');
    } else if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        errors.push('Le numéro de téléphone doit contenir entre 8 et 15 chiffres');
    }
    
    return errors;
}

export function validateName(name, fieldName) {
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

export function validateMessage(message) {
    const errors = [];
    
    if (!message || message.trim() === '') {
        errors.push('Le message ne peut pas être vide');
    } else if (message.trim().length > 1000) {
        errors.push('Le message ne peut pas dépasser 1000 caractères');
    }
    
    return errors;
}

export function validateLoginForm(phone) {
    return validatePhone(phone);
}

export function validateRegisterForm(firstname, lastname, phone) {
    const errors = [];
    
    errors.push(...validateName(firstname, 'Le prénom'));
    errors.push(...validateName(lastname, 'Le nom'));
    errors.push(...validatePhone(phone));
    
    return errors;
}

export function validateContactForm(phone) {
    return validatePhone(phone);
}

export function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}