// Variables globales de l'application
export let currentUser = null;
export let currentContact = null;
export let currentGroup = null;
export let contacts = [];
export let messageRefreshInterval = null;
export let mediaRecorder = null;
export let audioChunks = [];
export let stream = null;

// Setters pour modifier l'état
export function setCurrentUser(user) {
    currentUser = user;
}

export function setCurrentContact(contact) {
    currentContact = contact;
}

export function setCurrentGroup(group) {
    currentGroup = group;
}

export function setContacts(contactsList) {
    contacts = contactsList;
}

export function setMessageRefreshInterval(interval) {
    messageRefreshInterval = interval;
}

export function setMediaRecorder(recorder) {
    mediaRecorder = recorder;
}

export function setAudioChunks(chunks) {
    audioChunks = chunks;
}

export function setStream(mediaStream) {
    stream = mediaStream;
}

// Getters pour accéder aux variables
export function getCurrentUser() {
    return currentUser;
}

export function getCurrentContact() {
    return currentContact;
}

export function getCurrentGroup() {
    return currentGroup;
}

export function getContacts() {
    return contacts;
}

export function getMessageRefreshInterval() {
    return messageRefreshInterval;
}

export function getMediaRecorder() {
    return mediaRecorder;
}

export function getAudioChunks() {
    return audioChunks;
}

export function getStream() {
    return stream;
}