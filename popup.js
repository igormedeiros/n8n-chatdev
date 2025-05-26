document.addEventListener('DOMContentLoaded', () => {
  const geminiApiKeyInput = document.getElementById('geminiApiKey');
  const geminiModelSelect = document.getElementById('geminiModel');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['geminiApiKey', 'geminiModel'], (result) => {
    if (result.geminiApiKey) {
      geminiApiKeyInput.value = result.geminiApiKey;
    }
    if (result.geminiModel) {
      geminiModelSelect.value = result.geminiModel;
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const apiKey = geminiApiKeyInput.value;
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
      statusDiv.textContent = 'Settings saved!';
      statusDiv.style.color = 'green';
      setTimeout(() => {
        statusDiv.textContent = '';
        // Optionally close the popup after saving
        // window.close(); 
      }, 2000);
    });
  });
});
