document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const resultContent = document.getElementById('result-content');
    const actionPanel = document.getElementById('action-panel');
    const actionTitle = document.getElementById('action-title');
    
    // Panels
    const welcomeContent = document.getElementById('welcome-content');
    const commandSelectionPanel = document.getElementById('command-selection-panel');
    const manualInputPanel = document.getElementById('manual-input-panel');
    const addCommandPanel = document.getElementById('add-command-panel');
    const deleteCommandPanel = document.getElementById('delete-command-panel');
    const historyPanel = document.getElementById('history-panel');
    const commandsListPanel = document.getElementById('commands-list-panel');
    
    // Selects and inputs
    const commandType = document.getElementById('command-type');
    const commandSelect = document.getElementById('command-select');
    const commandToDelete = document.getElementById('command-to-delete');
    const manualCommand = document.getElementById('manual-command');
    const newCommand = document.getElementById('new-command');
    
    // Lists
    const detectedCommandsList = document.getElementById('detected-commands-list');
    const customCommandsList = document.getElementById('custom-commands-list');
    
    // Buttons
    const detectCommandsBtn = document.getElementById('detect-commands');
    const showCommandsBtn = document.getElementById('show-commands');
    const selectExecuteBtn = document.getElementById('select-execute');
    const manualExecuteBtn = document.getElementById('manual-execute');
    const addCommandBtn = document.getElementById('add-command');
    const deleteCommandBtn = document.getElementById('delete-command');
    const showHistoryBtn = document.getElementById('show-history');
    const clearResultBtn = document.getElementById('clear-result');
    
    // Action buttons
    const executeSelectedBtn = document.getElementById('execute-selected');
    const executeManualBtn = document.getElementById('execute-manual');
    const saveCommandBtn = document.getElementById('save-command');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    // Modal elements
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const commandToConfirm = document.getElementById('command-to-confirm');
    const confirmActionBtn = document.getElementById('confirm-action');
    
    // Global variables
    let detectedCommands = [];
    let customCommands = [];
    
    // Helper functions
    function showPanel(panel, title) {
        // Hide all panels
        welcomeContent.classList.add('d-none');
        commandSelectionPanel.classList.add('d-none');
        manualInputPanel.classList.add('d-none');
        addCommandPanel.classList.add('d-none');
        deleteCommandPanel.classList.add('d-none');
        historyPanel.classList.add('d-none');
        commandsListPanel.classList.add('d-none');
        
        // Show selected panel
        panel.classList.remove('d-none');
        
        // Update title
        actionTitle.textContent = title;
    }
    
    function showResult(message, append = false) {
        if (append) {
            resultContent.textContent += '\n\n' + message;
        } else {
            resultContent.textContent = message;
        }
        resultContent.scrollTop = resultContent.scrollHeight;
    }
    
    function updateCommandSelect() {
        commandSelect.innerHTML = '';
        
        const commands = commandType.value === 'detected' ? detectedCommands : customCommands;
        
        if (commands.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Aucune commande disponible';
            option.disabled = true;
            commandSelect.appendChild(option);
        } else {
            commands.forEach((cmd, index) => {
                const option = document.createElement('option');
                option.value = cmd;
                option.textContent = cmd;
                commandSelect.appendChild(option);
            });
        }
    }
    
    function updateDeleteCommandSelect() {
        commandToDelete.innerHTML = '';
        
        if (customCommands.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Aucune commande personnalisée';
            option.disabled = true;
            commandToDelete.appendChild(option);
        } else {
            customCommands.forEach((cmd, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = cmd;
                commandToDelete.appendChild(option);
            });
        }
    }
    
    function updateCommandsLists() {
        detectedCommandsList.innerHTML = '';
        customCommandsList.innerHTML = '';
        
        if (detectedCommands.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'Aucune commande détectée';
            detectedCommandsList.appendChild(li);
        } else {
            detectedCommands.forEach((cmd, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-command';
                li.textContent = `${index + 1}. ${cmd}`;
                detectedCommandsList.appendChild(li);
            });
        }
        
        if (customCommands.length === 0) {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'Aucune commande personnalisée';
            customCommandsList.appendChild(li);
        } else {
            customCommands.forEach((cmd, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-command';
                li.textContent = `${index + 1}. ${cmd}`;
                customCommandsList.appendChild(li);
            });
        }
    }
    
    // Fetch commands from server
    function fetchCommands() {
        fetch('/get_commands')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    detectedCommands = data.detected;
                    customCommands = data.custom;
                    updateCommandSelect();
                    updateDeleteCommandSelect();
                    updateCommandsLists();
                } else {
                    showResult('❌ Erreur: ' + data.message);
                }
            })
            .catch(error => {
                showResult('❌ Erreur de connexion: ' + error);
            });
    }
    
    // Initialize by fetching commands
    fetchCommands();
    
    // Event Listeners
    
    // Menu buttons
    detectCommandsBtn.addEventListener('click', function() {
        showResult('🔍 Détection des commandes Ubuntu...');
        
        fetch('/detect_commands', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            showResult(data.message);
            fetchCommands();
        })
        .catch(error => {
            showResult('❌ Erreur de connexion: ' + error);
        });
    });
    
    showCommandsBtn.addEventListener('click', function() {
        showPanel(commandsListPanel, '📂 Liste des commandes disponibles');
        fetchCommands();
    });
    
    selectExecuteBtn.addEventListener('click', function() {
        showPanel(commandSelectionPanel, '🔍 Sélectionner et exécuter une commande');
        fetchCommands();
    });
    
    manualExecuteBtn.addEventListener('click', function() {
        showPanel(manualInputPanel, '⌨️ Saisir manuellement une commande');
        manualCommand.value = '';
        manualCommand.focus();
    });
    
    addCommandBtn.addEventListener('click', function() {
        showPanel(addCommandPanel, '➕ Ajouter une commande personnalisée');
        newCommand.value = '';
        newCommand.focus();
    });
    
    deleteCommandBtn.addEventListener('click', function() {
        showPanel(deleteCommandPanel, '🗑️ Supprimer une commande personnalisée');
        fetchCommands();
    });
    
    showHistoryBtn.addEventListener('click', function() {
        showPanel(historyPanel, '📜 Historique des exécutions');
        
        fetch('/get_history')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const historyContent = document.getElementById('history-content');
                    if (data.history && data.history.length > 0) {
                        historyContent.textContent = data.history.join('');
                    } else {
                        historyContent.textContent = '⚠️ Aucun historique disponible.';
                    }
                } else {
                    showResult('❌ Erreur: ' + data.message);
                }
            })
            .catch(error => {
                showResult('❌ Erreur de connexion: ' + error);
            });
    });
    
    clearResultBtn.addEventListener('click', function() {
        resultContent.textContent = '';
    });
    
    // Action buttons
    commandType.addEventListener('change', updateCommandSelect);
    
    executeSelectedBtn.addEventListener('click', function() {
        const selectedCommand = commandSelect.value;
        
        if (!selectedCommand) {
            showResult('❌ Aucune commande sélectionnée.');
            return;
        }
        
        commandToConfirm.textContent = selectedCommand;
        
        confirmActionBtn.onclick = function() {
            confirmationModal.hide();
            
            showResult('🚀 Exécution de la commande...');
            
            fetch('/execute_command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    command: selectedCommand
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showResult(`${data.message}\n${data.output}`);
                } else {
                    showResult(data.message);
                }
            })
            .catch(error => {
                showResult('❌ Erreur de connexion: ' + error);
            });
        };
        
        confirmationModal.show();
    });
    
    executeManualBtn.addEventListener('click', function() {
        const command = manualCommand.value.trim();
        
        if (!command) {
            showResult('❌ Veuillez entrer une commande.');
            return;
        }
        
        commandToConfirm.textContent = command;
        
        confirmActionBtn.onclick = function() {
            confirmationModal.hide();
            
            showResult('🚀 Exécution de la commande...');
            
            fetch('/execute_command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    command: command
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showResult(`${data.message}\n${data.output}`);
                } else {
                    showResult(data.message);
                }
            })
            .catch(error => {
                showResult('❌ Erreur de connexion: ' + error);
            });
        };
        
        confirmationModal.show();
    });
    
    saveCommandBtn.addEventListener('click', function() {
        const command = newCommand.value.trim();
        
        if (!command) {
            showResult('❌ Veuillez entrer une commande.');
            return;
        }
        
        fetch('/add_custom_command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                command: command
            })
        })
        .then(response => response.json())
        .then(data => {
            showResult(data.message);
            if (data.status === 'success') {
                newCommand.value = '';
                fetchCommands();
            }
        })
        .catch(error => {
            showResult('❌ Erreur de connexion: ' + error);
        });
    });
    
    confirmDeleteBtn.addEventListener('click', function() {
        const index = commandToDelete.value;
        
        if (index === null || index === undefined) {
            showResult('❌ Veuillez sélectionner une commande à supprimer.');
            return;
        }
        
        fetch('/delete_custom_command', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index: parseInt(index)
            })
        })
        .then(response => response.json())
        .then(data => {
            showResult(data.message);
            if (data.status === 'success') {
                fetchCommands();
            }
        })
        .catch(error => {
            showResult('❌ Erreur de connexion: ' + error);
        });
    });
    
    // Enter key handlers
    manualCommand.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            executeManualBtn.click();
        }
    });
    
    newCommand.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            saveCommandBtn.click();
        }
    });
});
