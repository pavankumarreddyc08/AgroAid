// AgroAid Chatbot System

// Chatbot responses database
const chatbotResponses = {
    greetings: [
        "Hello! I'm your AgroAid Assistant. How can I help you with your crops today?",
        "Hi there! Ready to discuss your agricultural needs?",
        "Welcome! I'm here to help with crop disease detection and farming advice."
    ],
    
    diseases: [
        "Our AI can detect over 50+ fruit diseases including leaf blight, rust, powdery mildew, bacterial spot, and viral infections. Simply upload a clear photo of the affected leaf for instant analysis!",
        "We specialize in detecting diseases in Guava, Banana, and Mango. Our AI analyzes leaf patterns, discoloration, spots, and other symptoms to identify issues accurately."
    ],
    
    prevention: [
        "To prevent crop diseases: 1) Ensure proper drainage and avoid overwatering, 2) Maintain good air circulation, 3) Remove and destroy infected plant parts, 4) Use disease-resistant varieties, 5) Practice crop rotation, 6) Apply preventive organic sprays during vulnerable periods.",
        "Prevention is key! Regular monitoring, proper spacing between plants, balanced fertilization, and maintaining soil health are essential. Our AI can help detect early signs before diseases spread."
    ],
    
    fertilizers: [
        "Best fertilizers for fruits: 1) NPK (10-10-10) for balanced growth, 2) Organic compost for soil health, 3) Potassium-rich fertilizers for fruit quality, 4) Micronutrient supplements (Zinc, Boron) for better yield. Always soil test before application!",
        "For fruit trees, use slow-release fertilizers in early spring. Organic options like well-rotted manure, bone meal, and fish emulsion work great. Foliar sprays with seaweed extract boost plant immunity."
    ],
    
    treatment: [
        "Treatment depends on the disease type. For fungal infections: use copper-based or sulfur fungicides. For bacterial issues: remove infected parts and apply bactericides. For viral diseases: focus on vector control and remove affected plants. Always follow our AI's specific recommendations!",
        "After detecting a disease with our AI, follow the treatment plan provided. Generally: isolate affected plants, improve air circulation, adjust watering, and apply appropriate organic or chemical treatments as recommended."
    ],
    
    general: [
        "I'm here to help with crop disease detection, treatment advice, and general farming guidance. You can ask about diseases, prevention methods, fertilizers, or upload an image for instant AI analysis!",
        "Feel free to ask about any agricultural topics - disease identification, crop care, soil health, pest management, or use our AI detection feature to analyze your crops!"
    ],
    
    upload: [
        "Great! To detect diseases, go to our 'Detect' page, select your fruit type (Guava, Banana, or Mango), upload a clear photo of the leaf, and our AI will analyze it within seconds!",
        "Head to the Detection page to upload your plant image. Make sure the photo is clear and well-lit for best results!"
    ]
};

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const minimizeChat = document.getElementById('minimizeChat');
    const sendMessage = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatbotMessages');

    if (!chatbotButton) return;

    // Toggle chatbot
    chatbotButton.addEventListener('click', function() {
        chatbotButton.classList.toggle('active');
        chatbotWindow.classList.toggle('active');
    });

    // Minimize chat
    if (minimizeChat) {
        minimizeChat.addEventListener('click', function() {
            chatbotButton.classList.remove('active');
            chatbotWindow.classList.remove('active');
        });
    }

    // Send message on button click
    if (sendMessage) {
        sendMessage.addEventListener('click', function() {
            sendUserMessage();
        });
    }

    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }
});

// Send user message
function sendUserMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Get bot response after delay
    setTimeout(() => {
        hideTypingIndicator();
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 1000);
}

// Add message to chat
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatbotMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'user' ? '👤' : '🌿'}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatbotMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🌿</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.remove();
    }
}

// Get bot response based on user message
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.match(/\b(hi|hello|hey|greetings)\b/)) {
        return getRandomResponse(chatbotResponses.greetings);
    }
    
    // Check for disease-related questions
    if (lowerMessage.match(/\b(disease|detect|identify|diagnosis)\b/)) {
        return getRandomResponse(chatbotResponses.diseases);
    }
    
    // Check for prevention questions
    if (lowerMessage.match(/\b(prevent|prevention|avoid|protect)\b/)) {
        return getRandomResponse(chatbotResponses.prevention);
    }
    
    // Check for fertilizer questions
    if (lowerMessage.match(/\b(fertilizer|fertiliser|nutrient|feed)\b/)) {
        return getRandomResponse(chatbotResponses.fertilizers);
    }
    
    // Check for treatment questions
    if (lowerMessage.match(/\b(treatment|treat|cure|remedy|solution)\b/)) {
        return getRandomResponse(chatbotResponses.treatment);
    }
    
    // Check for upload questions
    if (lowerMessage.match(/\b(upload|photo|image|picture|scan)\b/)) {
        return getRandomResponse(chatbotResponses.upload);
    }
    
    // Default response
    return getRandomResponse(chatbotResponses.general);
}

// Get random response from array
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Send quick question
function sendQuickQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = question;
    sendUserMessage();
}

// Add typing animation styles
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        padding: 8px 0;
    }

    .typing-dots span {
        width: 8px;
        height: 8px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) {
        animation-delay: 0s;
    }

    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }

    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes typingBounce {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-10px);
        }
    }

    /* Scrollbar styling for chat messages */
    .chatbot-messages::-webkit-scrollbar {
        width: 6px;
    }

    .chatbot-messages::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }

    .chatbot-messages::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
    }

    .chatbot-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;
document.head.appendChild(style);