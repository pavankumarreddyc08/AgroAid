// AgroAid AI Chatbot (Flask + OpenRouter Connected)

// --------------------------------------------------
// INITIALIZE CHATBOT
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const chatbotButton = document.getElementById("chatbotButton");
  const chatbotWindow = document.getElementById("chatbotWindow");
  const minimizeChat = document.getElementById("minimizeChat");
  const sendMessageBtn = document.getElementById("sendMessage");
  const chatInput = document.getElementById("chatInput");

  if (!chatbotButton) return;

  // Toggle chatbot window
  chatbotButton.addEventListener("click", function () {
    chatbotButton.classList.toggle("active");
    chatbotWindow.classList.toggle("active");
  });

  // Close chatbot
  if (minimizeChat) {
    minimizeChat.addEventListener("click", function () {
      chatbotButton.classList.remove("active");
      chatbotWindow.classList.remove("active");
    });
  }

  // Send message button
  if (sendMessageBtn) {
    sendMessageBtn.addEventListener("click", function () {
      sendUserMessage();
    });
  }

  // Enter key support
  if (chatInput) {
    chatInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        sendUserMessage();
      }
    });
  }
});

// --------------------------------------------------
// SEND USER MESSAGE
// --------------------------------------------------

async function sendUserMessage() {
  const chatInput = document.getElementById("chatInput");
  const message = chatInput.value.trim();

  if (!message) return;

  addMessage(message, "user");
  chatInput.value = "";

  showTypingIndicator();

  try {
    const response = await getBotResponseFromAPI(message);
    hideTypingIndicator();
    addMessage(response, "bot");
  } catch (error) {
    hideTypingIndicator();
    addMessage("AI service unavailable. Please try again later.", "bot");
  }
}

// --------------------------------------------------
// CONNECT TO FLASK BACKEND
// --------------------------------------------------

async function getBotResponseFromAPI(message) {
  const response = await fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.reply;
}

// --------------------------------------------------
// ADD MESSAGE TO CHAT
// --------------------------------------------------

function addMessage(text, sender) {
  const chatMessages = document.getElementById("chatbotMessages");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${
    sender === "user" ? "user-message" : "bot-message"
  }`;

  messageDiv.innerHTML = `
      <div class="message-avatar">${sender === "user" ? "👤" : "🌿"}</div>
      <div class="message-content">
          <p>${text}</p>
      </div>
  `;

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --------------------------------------------------
// TYPING INDICATOR
// --------------------------------------------------

function showTypingIndicator() {
  const chatMessages = document.getElementById("chatbotMessages");

  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message typing-indicator";
  typingDiv.id = "typingIndicator";

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

function hideTypingIndicator() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

// --------------------------------------------------
// QUICK QUESTION SUPPORT
// --------------------------------------------------

function sendQuickQuestion(question) {
  const chatInput = document.getElementById("chatInput");
  chatInput.value = question;
  sendUserMessage();
}

// --------------------------------------------------
// SAFE STYLE INJECTION (NO DUPLICATE ERROR)
// --------------------------------------------------

if (!document.getElementById("chatbot-typing-style")) {
  const style = document.createElement("style");
  style.id = "chatbot-typing-style";

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

    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
    }
  `;

  document.head.appendChild(style);
}
