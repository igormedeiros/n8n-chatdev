// This script would manage the chat UI if it were a separate document (e.g., in an iframe)
// or if the UI logic in content_script.js was refactored into this file.

// For now, the actual UI interaction logic is within content_script.js.
// This file serves as a conceptual placeholder for that logic.

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput'); // Assuming 'chatInput' from chat_ui.html
    const sendButton = document.getElementById('sendChatMessage'); // Assuming 'sendChatMessage' from chat_ui.html
    const messagesDiv = document.getElementById('chatMessages'); // Assuming 'chatMessages' from chat_ui.html

    // This function would be provided by the content script to bridge communication
    // For this example, it's a placeholder. In reality, content_script.js would expose
    // a way to send messages to the background script.
    let sendMessageToContentScript = (message) => {
        console.warn("ChatUI: sendMessageToContentScript is not fully implemented. Message:", message);
        // Example: chrome.runtime.sendMessage(message) if this script had direct background access,
        // or window.parent.postMessage if in an iframe and communicating with content script.
    };

    // Function to initialize communication (e.g., if content_script needs to pass a reference)
    function initializeChatUI(messageSender) {
        if (typeof messageSender === 'function') {
            sendMessageToContentScript = messageSender;
        }
        console.log("ChatUI initialized (conceptually).");
    }


    if (sendButton && chatInput && messagesDiv) {
        sendButton.addEventListener('click', () => {
            const messageText = chatInput.value.trim();
            if (messageText) {
                displayMessage(messageText, 'user');
                sendMessageToContentScript({
                    action: "processUserRequest", // Matches action in background.js
                    prompt: messageText
                });
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendButton.click();
            }
        });
    } else {
        console.log("ChatUI: Chat input/button/messages elements not found (this is expected if UI is injected by content_script.js).");
    }

    function displayMessage(text, type) {
        if (!messagesDiv) return;
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
        
        if (type === 'ai' && typeof text === 'object') {
            // Basic rendering for AI object responses (like the mock from background.js)
            messageElement.innerHTML = `<strong>Gemini:</strong> ${text.message || ''}`;
            if (text.n8nWorkflowData) {
                const pre = document.createElement('pre');
                pre.textContent = JSON.stringify(text.n8nWorkflowData, null, 2);
                messageElement.appendChild(pre);
            }
        } else {
            messageElement.textContent = text;
        }
        
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
    }

    // Expose functions if this script were to be interacted with by content_script
    // window.chatUI = {
    //  initialize: initializeChatUI,
    //  displayAIMessage: (message) => displayMessage(message, 'ai')
    // };

    console.log("chat_ui.js loaded (conceptual).");
});
