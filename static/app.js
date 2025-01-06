// DOM Elements
const elements = {
    wikiInput: document.getElementById('wikiUrl'),
    generateBtn: document.getElementById('generateBtn'),
    randomBtn: document.getElementById('randomBtn'),
    loader: document.querySelector('.loader'),
    error: document.querySelector('.error'),
    result: document.querySelector('.result'),
    summaryContent: document.querySelector('.summary-content'),
    sourceContent: document.querySelector('.source-content'),
    toast: document.querySelector('.toast'),
    modal: document.getElementById('sourceModal')
};

// State Management
let state = {
    isLoading: false,
    currentUtterance: null,
    lastGeneratedSummary: null
};

// Event Listeners
elements.wikiInput.addEventListener('input', validateInput);
elements.generateBtn.addEventListener('click', generateSummary);
elements.randomBtn.addEventListener('click', generateRandomSummary);
document.addEventListener('keydown', handleKeyboardShortcuts);

// Input Validation
function validateInput() {
    const isValid = elements.wikiInput.checkValidity();
    elements.generateBtn.disabled = !isValid;
    return isValid;
}

// Main Generation Function
async function generateSummary() {
    if (state.isLoading || !validateInput()) return;

    resetUI();
    startLoading();

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: elements.wikiInput.value.trim() })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate summary');
        }

        state.lastGeneratedSummary = data;
        displayResult(data);
    } catch (error) {
        showError(error.message);
    } finally {
        stopLoading();
    }
}

// Random Article Generation
async function generateRandomSummary() {
    resetUI();
    startLoading();

    try {
        const response = await fetch('/random');
        
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned unexpected content type. Please try again.");
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate summary');
        }

        if (!data.url || !data.content || !data.summary) {
            throw new Error('Incomplete data received from server');
        }

        // Update input field with the random article URL
        elements.wikiInput.value = data.url;

        state.lastGeneratedSummary = data;
        displayResult(data);
    } catch (error) {
        console.error('Error during random summary generation:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
        stopLoading();
    }
}

// UI State Management
function resetUI() {
    elements.error.style.display = 'none';
    elements.result.style.display = 'none';
    elements.result.classList.remove('visible');
    stopSpeech();
}

function startLoading() {
    state.isLoading = true;
    elements.loader.style.display = 'block';
    elements.generateBtn.disabled = true;
    elements.randomBtn.disabled = true;
}

function stopLoading() {
    state.isLoading = false;
    elements.loader.style.display = 'none';
    elements.generateBtn.disabled = !validateInput();
    elements.randomBtn.disabled = false;
}

function displayResult(data) {
    elements.summaryContent.textContent = data.summary;
    elements.sourceContent.textContent = data.content;
    elements.result.style.display = 'block';

    requestAnimationFrame(() => {
        elements.result.classList.add('visible');
        scrollToResult();
    });
}

function scrollToResult() {
    elements.result.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
}

// Toast Notifications
function showToast(message, duration = 2000) {
    elements.toast.textContent = message;
    elements.toast.style.opacity = '1';

    setTimeout(() => {
        elements.toast.style.opacity = '0';
    }, duration);
}

// Speech Synthesis
let speechQueue = [];
let isSpeaking = false;

function speakSummary() {
    if (isSpeaking) {
        stopSpeech();
        return;
    }

    const text = elements.summaryContent.textContent;
    if (!text) return;

    speechQueue = splitTextIntoChunks(text);
    isSpeaking = true;
    speakNextChunk();
}

function splitTextIntoChunks(text) {
    return text.split(/(?<=[.!?])\s+/)
        .filter(chunk => chunk.trim().length > 0);
}

function speakNextChunk() {
    if (speechQueue.length === 0) {
        isSpeaking = false;
        return;
    }

    const chunk = speechQueue.shift();
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onend = () => {
        if (isSpeaking) {
            speakNextChunk();
        }
    };

    speechSynthesis.speak(utterance);
}

function stopSpeech() {
    speechSynthesis.cancel();
    speechQueue = [];
    isSpeaking = false;
}

// Clipboard Operations
async function copyToClipboard() {
    const text = elements.summaryContent.textContent;
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard');
    } catch (err) {
        showToast('Failed to copy text');
    }
}

// Sharing
async function shareAd() {
    const text = elements.summaryContent.textContent;
    if (!text) return;

    try {
        if (navigator.share) {
            await navigator.share({
                title: 'SumWik Summary',
                text: text,
                url: window.location.href
            });
            showToast('Shared successfully');
        } else {
            await copyToClipboard();
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast('Failed to share');
        }
    }
}

// Modal Functions
function showSource() {
    elements.modal.style.display = 'block';
    requestAnimationFrame(() => {
        elements.modal.classList.add('visible');
    });
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modal.classList.remove('visible');
    setTimeout(() => {
        elements.modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 250);
}

// Handle click outside modal to close
elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        closeModal();
    }
});

// Export Functionality
function exportAsHtml() {
    const text = elements.summaryContent.textContent;
    if (!text) return;

    const htmlContent = generateHtmlTemplate(text);
    downloadFile(htmlContent, 'summary.html', 'text/html');
    showToast('Downloaded HTML file');
}

function generateHtmlTemplate(summaryText) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SumWik Summary</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 650px;
            margin: 2rem auto;
            padding: 0 1rem;
            line-height: 1.7;
            color: #1a1a1a;
        }
        .summary {
            font-size: 1.2rem;
            white-space: pre-line;
            padding: 2rem;
            background: #f5f5f5;
            border-radius: 12px;
        }
        @media (prefers-color-scheme: dark) {
            body { background: #1a1a1a; color: #f5f5f5; }
            .summary { background: #2d2d2d; }
        }
    </style>
</head>
<body>
    <div class="summary">${summaryText}</div>
</body>
</html>`;
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Escape key to close modal
    if (e.key === 'Escape' && elements.modal.style.display === 'block') {
        closeModal();
        return;
    }

    // Command/Ctrl + Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!elements.generateBtn.disabled) {
            generateSummary();
        }
        return;
    }

    // Command/Ctrl + C to copy when summary is displayed
    if ((e.metaKey || e.ctrlKey) && e.key === 'c' &&
        elements.result.style.display === 'block') {
        copyToClipboard();
    }
}

// Initialize
validateInput();
