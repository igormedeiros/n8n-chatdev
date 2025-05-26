console.log("n8n Gemini Copilot: Content script loaded.");

// --- UI Injection (Placeholder) ---
function injectChatUIPlaceholder() {
  const placeholderDiv = document.createElement('div');
  placeholderDiv.id = 'gemini-copilot-placeholder-ui';
  placeholderDiv.style.position = 'fixed';
  placeholderDiv.style.bottom = '20px';
  placeholderDiv.style.right = '20px';
  placeholderDiv.style.width = '300px';
  placeholderDiv.style.height = '400px';
  placeholderDiv.style.backgroundColor = 'lightgray';
  placeholderDiv.style.border = '2px solid #444';
  placeholderDiv.style.zIndex = '9999';
  placeholderDiv.style.padding = '10px';
  placeholderDiv.style.boxSizing = 'border-box';
  placeholderDiv.innerHTML = `
    <h3>Gemini Copilot (Placeholder)</h3>
    <p>Chat UI will be here.</p>
    <input type="text" id="userInput" placeholder="Type your request..." style="width: calc(100% - 10px); margin-bottom: 5px;">
    <button id="sendToBgButton">Send to Background</button>
    <div id="responseArea" style="margin-top: 10px; font-size: 12px; max-height: 200px; overflow-y: auto; background: white; padding: 5px;">Response will appear here.</div>
  `;
  document.body.appendChild(placeholderDiv);

  console.log("n8n Gemini Copilot: Placeholder UI injected.");

  // Example: Sending a message to background.js when a button in the injected UI is clicked
  const sendButton = document.getElementById('sendToBgButton');
  const userInput = document.getElementById('userInput');
  if (sendButton && userInput) {
    sendButton.addEventListener('click', () => {
      const prompt = userInput.value;
      if (prompt) {
        console.log("ContentScript: Sending prompt to background:", prompt);
        sendMessageToBackground({ action: "processUserRequest", prompt: prompt });
        userInput.value = ""; // Clear input
      }
    });
  } else {
    console.error("ContentScript: Could not find send button or input in injected UI.");
  }
}

// --- Communication with Background Script ---
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(message, (response) => {
    const responseArea = document.getElementById('responseArea');
    if (chrome.runtime.lastError) {
      console.error("ContentScript: Error sending message or receiving response:", chrome.runtime.lastError.message);
      if(responseArea) responseArea.textContent = `Error: ${chrome.runtime.lastError.message}`;
      return;
    }
    console.log("ContentScript: Received response from background:", response);
    if (responseArea) {
        if (response.success) {
            responseArea.innerHTML = `<strong>Gemini (mock):</strong> ${response.data.message}<br>`;
            if(response.data.n8nWorkflowData){
                responseArea.innerHTML += `<pre>${JSON.stringify(response.data.n8nWorkflowData, null, 2)}</pre>`;
            }
        } else {
            responseArea.textContent = `Error: ${response.error}`;
        }
    }
  });
}

// Listener for messages from background script (if background needs to initiate)
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "displayWorkflow") {
//     console.log("ContentScript: Received command to display workflow:", request.data);
//     // Logic to display/insert workflow into n8n canvas would go here
//     const responseArea = document.getElementById('responseArea');
//     if(responseArea) responseArea.innerHTML += `<br/><strong>Background says:</strong> ${request.data}`;
//   }
//   sendResponse({status: "received"}); // Acknowledge message
//   return true;
// });


// --- Main Execution ---
// Inject the UI once the page is suitable (e.g., fully loaded)
// For simplicity, injecting after a short delay, but a more robust check might be needed for n8n's specific SPA structure.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatUIPlaceholder);
} else {
    // DOMContentLoaded has already fired
    // Using a timeout to give SPA frameworks a moment to finish rendering initial view
    setTimeout(injectChatUIPlaceholder, 500);
}

// Example of how to "read" workflow data (very basic and might not work directly with n8n's complex structure)
// This is a placeholder for a more advanced feature.
function attemptToReadWorkflow() {
    // This is highly dependent on n8n's internal DOM structure or available global JS variables.
    // For example, if n8n stores its workflow data in a global variable or a specific DOM element:
    // const workflowDataElement = document.getElementById('workflow-data-json'); // Fictional element
    // if (workflowDataElement) {
    //   try {
    //     const workflowJson = JSON.parse(workflowDataElement.textContent);
    //     console.log("Attempted to read workflow JSON:", workflowJson);
    //     // Send this to background for context if needed
    //   } catch (e) {
    //     console.error("Error parsing workflow data:", e);
    //   }
    // } else {
    //   console.log("Workflow data element not found (this is just a placeholder example).");
    // }
}

// Call it for demonstration, though it won't do much without n8n's actual structure
// setTimeout(attemptToReadWorkflow, 2000);
