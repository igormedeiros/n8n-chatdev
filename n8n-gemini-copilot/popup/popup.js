document.addEventListener('DOMContentLoaded', () => {
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const geminiModelSelect = document.getElementById('geminiModel');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['geminiApiKey', 'geminiModel'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error retrieving settings:', chrome.runtime.lastError.message);
      statusDiv.textContent = 'Error loading settings.';
      statusDiv.style.color = 'red';
      return;
    }
    if (result.geminiApiKey) {
      geminiApiKeyInput.value = result.geminiApiKey;
    }
    if (result.geminiModel) {
      geminiModelSelect.value = result.geminiModel;
    } else {
      // Set a default model if none is saved
      geminiModelSelect.value = 'gemini-1.5-pro'; // Default model
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const apiKey = geminiApiKeyInput.value.trim();
    const model = geminiModelSelect.value;

    if (!apiKey) {
      statusDiv.textContent = 'Error: API Key cannot be empty.';
      statusDiv.style.color = 'red';
      setTimeout(() => statusDiv.textContent = '', 3000);
      return;
    }

    chrome.storage.sync.set({
      geminiApiKey: apiKey,
      geminiModel: model
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError.message);
        statusDiv.textContent = 'Error saving settings.';
        statusDiv.style.color = 'red';
      } else {
        statusDiv.textContent = 'Settings saved!';
        statusDiv.style.color = 'green';
      }
      setTimeout(() => {
        statusDiv.textContent = '';
        // Optionally close the popup after saving
        // window.close();
      }, 2000);
    });
  });
});
