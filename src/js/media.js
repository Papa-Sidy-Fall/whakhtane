import { sendMessage } from './api/messages.js';
import { currentUser, currentContact, setMediaRecorder, setAudioChunks, setStream, mediaRecorder, audioChunks, stream } from './state.js';
import { showNotification } from './utils/ui.js';
import { loadMessages } from './messages.js';

export function setupMediaHandlers() {
    setupAudioRecording();
    setupImageUpload();
    setupVideoUpload();
}

function setupAudioRecording() {
    const recordBtn = document.getElementById('record-btn');
    let isRecording = false;

    recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(mediaStream);
                
                let options = { mimeType: 'audio/wav' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: 'audio/webm;codecs=opus' };
                }
                
                const recorder = new MediaRecorder(mediaStream, options);
                setMediaRecorder(recorder);
                setAudioChunks([]);
                
                recorder.ondataavailable = e => audioChunks.push(e.data);
                recorder.onstop = async () => {
                    if (audioChunks.length === 0) return;
                    const audioBlob = new Blob(audioChunks, { type: options.mimeType });
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Audio = reader.result;
                        await sendMessage({
                            senderId: currentUser.id,
                            receiverId: currentContact.id,
                            content: "",
                            audio: base64Audio,
                            timestamp: new Date().toISOString()
                        });
                        loadMessages();
                    };
                    reader.readAsDataURL(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                recorder.start();
                recordBtn.textContent = '⏹️';
                isRecording = true;
            } catch (err) {
                showNotification('Erreur accès micro ou enregistrement', 'error');
            }
        } else {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                recordBtn.textContent = '🎤';
                isRecording = false;
            }
        }
    });
}

function setupImageUpload() {
    const imageInput = document.getElementById('image-input');
    const imageBtn = document.getElementById('image-btn');

    imageBtn.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({
                senderId: currentUser.id,
                receiverId: currentContact.id,
                content: "",
                image: reader.result,
                timestamp: new Date().toISOString()
            });
            loadMessages();
        };
        reader.readAsDataURL(file);
        imageInput.value = "";
    });
}

function setupVideoUpload() {
    const videoInput = document.getElementById('video-input');
    const videoBtn = document.getElementById('video-btn');

    videoBtn.addEventListener('click', () => {
        videoInput.click();
    });

    videoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({
                senderId: currentUser.id,
                receiverId: currentContact.id,
                content: "",
                video: reader.result,
                timestamp: new Date().toISOString()
            });
            loadMessages();
        };
        reader.readAsDataURL(file);
        videoInput.value = "";
    });
}