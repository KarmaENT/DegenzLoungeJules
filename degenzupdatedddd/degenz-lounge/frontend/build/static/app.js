// Main JavaScript for DeGeNz Lounge
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const sandboxTab = document.getElementById('sandbox-tab');
    const personaTab = document.getElementById('persona-tab');
    const sandboxView = document.getElementById('sandbox-view');
    const personaView = document.getElementById('persona-view');
    
    sandboxTab.addEventListener('click', function() {
        sandboxTab.classList.add('active');
        personaTab.classList.remove('active');
        sandboxView.classList.remove('hidden');
        personaView.classList.add('hidden');
    });
    
    personaTab.addEventListener('click', function() {
        personaTab.classList.add('active');
        sandboxTab.classList.remove('active');
        personaView.classList.remove('hidden');
        sandboxView.classList.add('hidden');
    });
    
    // Simulate drag and drop functionality
    const agentCards = document.querySelectorAll('.agent-card');
    const agentDropzone = document.querySelector('.agent-dropzone');
    
    agentCards.forEach(card => {
        card.addEventListener('click', function() {
            // Clear the dropzone placeholder text
            agentDropzone.innerHTML = '';
            
            // Get agent details
            const agentName = this.querySelector('h3').textContent;
            const agentRole = this.querySelector('.role').textContent;
            
            // Create a chip for the agent
            const chip = document.createElement('div');
            chip.className = 'agent-chip regular';
            chip.innerHTML = agentName;
            
            // Add the chip to the dropzone
            agentDropzone.appendChild(chip);
            
            // Enable the message input
            document.querySelector('.message-input').disabled = false;
            document.querySelector('.send-button').disabled = false;
        });
    });
    
    // Simulate message sending in sandbox
    const sandboxMessageForm = document.querySelector('.sandbox-workspace form');
    const sandboxMessageInput = sandboxMessageForm.querySelector('.message-input');
    const sandboxMessagesContainer = document.querySelector('.sandbox-workspace .messages-container');
    
    sandboxMessageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageText = sandboxMessageInput.value.trim();
        if (!messageText) return;
        
        // Add user message
        addMessage(sandboxMessagesContainer, messageText, 'user');
        
        // Clear input
        sandboxMessageInput.value = '';
        
        // Simulate agent response after a delay
        setTimeout(() => {
            const responses = [
                "I've analyzed your request and I'm working on a solution.",
                "Based on my analysis, I recommend the following approach...",
                "Let me break this down into manageable steps for you.",
                "I've identified several key factors to consider in this scenario."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // Get the agent name from the chip
            const agentChip = document.querySelector('.agent-chip');
            const agentName = agentChip ? agentChip.textContent : "AI Agent";
            
            addMessage(sandboxMessagesContainer, randomResponse, 'agent', agentName, "Assistant");
        }, 1000);
    });
    
    // Persona mode agent selection
    const agentOptions = document.querySelectorAll('.agent-option');
    const personaMessageForm = document.querySelector('.persona-mode form');
    const personaMessageInput = personaMessageForm.querySelector('.message-input');
    const personaMessagesContainer = document.querySelector('.persona-mode .messages-container');
    
    agentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selection from all options
            agentOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            this.classList.add('selected');
            
            // Clear messages
            personaMessagesContainer.innerHTML = '';
            
            // Add welcome message
            const agentName = this.querySelector('.font-medium').textContent;
            const agentRole = this.querySelector('.text-sm').textContent;
            
            addMessage(
                personaMessagesContainer, 
                `Hello, I'm ${agentName}. ${agentRole} How can I assist you today?`, 
                'agent',
                agentName,
                agentRole
            );
            
            // Enable the message input
            personaMessageInput.disabled = false;
            personaMessageInput.placeholder = `Message ${agentName}...`;
            personaMessageForm.querySelector('.send-button').disabled = false;
        });
    });
    
    // Simulate message sending in persona mode
    personaMessageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const messageText = personaMessageInput.value.trim();
        if (!messageText) return;
        
        // Add user message
        addMessage(personaMessagesContainer, messageText, 'user');
        
        // Clear input
        personaMessageInput.value = '';
        
        // Simulate agent response after a delay
        setTimeout(() => {
            const selectedAgent = document.querySelector('.agent-option.selected');
            if (!selectedAgent) return;
            
            const agentName = selectedAgent.querySelector('.font-medium').textContent;
            const agentRole = selectedAgent.querySelector('.text-sm').textContent;
            
            // Different responses based on agent type
            let response = "";
            if (agentName.includes("Data Scientist")) {
                response = "Based on my analysis of the data, I can see several interesting patterns. Let me explain the key insights...";
            } else if (agentName.includes("Copywriter")) {
                response = "I've crafted some compelling messaging that should resonate with your target audience. Here's my suggestion...";
            } else if (agentName.includes("Marketing")) {
                response = "From a strategic perspective, we should focus on these key marketing channels to maximize our ROI...";
            } else {
                response = "I've considered your request carefully and have some thoughts to share...";
            }
            
            addMessage(personaMessagesContainer, response, 'agent', agentName, agentRole);
        }, 1000);
    });
    
    // Helper function to add a message to the chat
    function addMessage(container, text, sender, agentName = null, agentRole = null) {
        // Clear placeholder if it exists
        if (container.querySelector('.text-center')) {
            container.innerHTML = '';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (sender === 'agent' && agentName) {
            const agentInfo = document.createElement('div');
            agentInfo.className = 'text-xs font-semibold mb-1';
            agentInfo.textContent = `${agentName} (${agentRole})`;
            contentDiv.appendChild(agentInfo);
        }
        
        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        contentDiv.appendChild(textDiv);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'text-xs mt-1 opacity-70';
        timeDiv.textContent = new Date().toLocaleTimeString();
        contentDiv.appendChild(timeDiv);
        
        messageDiv.appendChild(contentDiv);
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
});
