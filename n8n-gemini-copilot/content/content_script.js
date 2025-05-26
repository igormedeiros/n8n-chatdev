// n8n-gemini-copilot/content/content_script.js
(async () => {
  console.log("n8n Gemini Copilot: Content script loaded.");

  const SIDEBAR_ID = 'gemini-chat-sidebar';
  let chatInput, sendButton, messagesDiv, settingsButton;

  function createChatSidebar() {
    if (document.getElementById(SIDEBAR_ID)) {
      console.log("n8n Gemini Copilot: Sidebar already exists.");
      return;
    }

    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    sidebar.innerHTML = `
      <div class="gemini-chat-header">
        <h3>n8n Gemini Copilot</h3>
        <button id="geminiChatSettingsBtn" class="gemini-chat-settings-btn" title="Settings">⚙️</button>
      </div>
      <div class="gemini-chat-messages" id="geminiChatMessages">
        <div class="gemini-chat-message ai-message">Hello! How can I assist you with n8n today?</div>
      </div>
      <div class="gemini-chat-input-area">
        <textarea id="geminiChatInput" placeholder="Describe your n8n task..." rows="2"></textarea>
        <button id="geminiChatSendBtn" title="Send">▶</button>
      </div>
    `;
    document.body.appendChild(sidebar);
    console.log("n8n Gemini Copilot: Chat sidebar injected.");

    // Assign elements after they are added to DOM
    chatInput = document.getElementById('geminiChatInput');
    sendButton = document.getElementById('geminiChatSendBtn');
    messagesDiv = document.getElementById('geminiChatMessages');
    settingsButton = document.getElementById('geminiChatSettingsBtn');

    // Add event listeners
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
    settingsButton.addEventListener('click', () => {
      // Placeholder for settings functionality
      console.log("Settings button clicked. Implement functionality (e.g., open popup or options page).");
      // Example: Open the extension's popup (might not work from content script directly, typically background handles this)
      // chrome.runtime.sendMessage({ action: "openPopup" });
      alert("Settings: Configure API Key via the extension icon popup.");
    });
  }

  function handleSendMessage() {
    const prompt = chatInput.value.trim();
    if (!prompt) return;

    displayMessage(prompt, 'user-message');
    chatInput.value = '';
    sendButton.disabled = true; // Disable button while waiting for response

    chrome.runtime.sendMessage({ action: "sendToGemini", prompt: prompt }, (response) => {
      sendButton.disabled = false; // Re-enable button
      if (chrome.runtime.lastError) {
        console.error("ContentScript: Error sending message or receiving response:", chrome.runtime.lastError.message);
        displayMessage(`Error: ${chrome.runtime.lastError.message}`, 'error-message');
        return;
      }

      console.log("ContentScript: Received response from background:", response);
      if (response.success) {
        // Assuming response.data contains the actual message/workflow from Gemini (currently mock)
        let aiResponseContent = "Received a response.";
        if (response.data && response.data.message) {
            aiResponseContent = response.data.message;
        }
        if (response.data && response.data.processedWorkflow) {
            // For now, just show the mock node name or a summary
            aiResponseContent += ` (Workflow: ${response.data.processedWorkflow.nodes[0].name})`;
            // In future, this is where you'd call a function to parse and inject the workflow
            // e.g., injectN8nWorkflow(response.data.processedWorkflow);
            console.log("Mock workflow data received:", response.data.processedWorkflow);
        }
        displayMessage(aiResponseContent, 'ai-message');

      } else {
        displayMessage(`Error from Gemini: ${response.error || 'Unknown error'}`, 'error-message');
      }
    });
  }

  function displayMessage(text, className) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('gemini-chat-message', className);
    // Simple text display for now. For complex HTML or preformatted JSON, more handling is needed.
    if (typeof text === 'object') {
        messageElement.textContent = JSON.stringify(text, null, 2);
    } else {
        messageElement.textContent = text;
    }
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll to latest message
  }

  async function injectStyles() {
    try {
      const cssPath = chrome.runtime.getURL('content/ui/chat.css');
      // In Manifest V3, CSS is injected via chrome.scripting.insertCSS
      // The content script needs "scripting" permission and host permissions for the target page.
      // The target is inferred from the "activeTab" or specified explicitly.
      // Since this content script runs on matched pages, we can use its context.
      await chrome.scripting.insertCSS({
        target: { tabId: (await getCurrentTabId()) }, // Helper needed if not directly available
        files: ['content/ui/chat.css']
      });
      console.log("n8n Gemini Copilot: Styles injected successfully.");
    } catch (err) {
      console.error("n8n Gemini Copilot: Failed to inject CSS.", err);
    }
  }

  // Helper to get current tab ID - needed for chrome.scripting.insertCSS if sender.tab is not available
  // This is a bit of a workaround as content scripts don't directly get their tabId easily for scripting.executeScript/insertCSS
  // A message to background might be more robust if sender.tab is not populated as expected.
  // However, for insertCSS from a content script for its own tab, it should often work without explicit tabId.
  // Let's try without explicit tabId first for insertCSS as it's simpler.
  async function injectStylesSimplified() {
    try {
        // For content scripts, insertCSS applies to the frame the script is in.
        // `target` is only needed if injecting into a different tab/frame from background.
        await chrome.scripting.insertCSS({files: ['content/ui/chat.css']});
        console.log("n8n Gemini Copilot: Styles injected successfully (simplified).");
    } catch (err) {
        console.error("n8n Gemini Copilot: Failed to inject CSS (simplified). Error:", err);
        // Fallback or more detailed error handling might be needed if this fails.
    }
  }


  // Illustrative DOM injection as per prompt
  function illustrativeDomInjection() {
    const illustrativeDiv = document.createElement('div');
    illustrativeDiv.id = 'gemini-chat'; // Style this with CSS if needed (e.g., from chat.css)
    illustrativeDiv.textContent = 'Hello world (Illustrative div)';
    document.body.appendChild(illustrativeDiv);
    console.log("n8n Gemini Copilot: Illustrative 'Hello world' div injected.");
  }

  // Listener for messages from background (e.g., if background needs to push a notification)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("ContentScript: Message received from background/popup:", message);
    if (message.action === "showNotificationInChat") {
      displayMessage(message.text, message.type || 'ai-message');
      sendResponse({status: "Notification shown"});
    }
    return true; // Keep channel open for async response if needed
  });


  // --- Main Execution ---
  // Ensure DOM is ready before trying to manipulate it.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createChatSidebar();
      injectStylesSimplified();
      illustrativeDomInjection();
    });
  } else {
      createChatSidebar();
      injectStylesSimplified(); // Call simplified version
      illustrativeDomInjection();
  }

})(); // IIFE to encapsulate scope
