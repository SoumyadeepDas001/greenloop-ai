export function renderChat() {
    return `
    <div class="screen fade-in chat-screen">
        <header class="top-nav" style="padding-bottom: 10px;">
            <h1 class="logo">GreenLoop Assistant</h1>
            <p class="subtitle" style="font-size: 0.9rem; color: var(--text-light); margin-top: 2px;">Ask about your plants or matches</p>
        </header>

        <div class="chat-chips-container" style="padding: 10px 20px; overflow-x: auto; white-space: nowrap; display: flex; gap: 10px; border-bottom: 1px solid var(--glass-border);">
            <button class="chip" onclick="window.app.fillChat('How do I care for marigolds?')">How do I care for marigolds?</button>
            <button class="chip" onclick="window.app.fillChat('Where\\'s my pickup?')">Where's my pickup?</button>
            <button class="chip" onclick="window.app.fillChat('What plants suit my balcony?')">What plants suit my balcony?</button>
            <button class="chip" onclick="window.app.fillChat('Why are my leaves turning yellow?')">Why are my leaves turning yellow?</button>
            <button class="chip" onclick="window.app.fillChat('How do I list an item for exchange?')">How do I list an item for exchange?</button>
            <button class="chip" onclick="window.app.fillChat('What can I upcycle from a glass jar?')">What can I upcycle from a glass jar?</button>
            <button class="chip" onclick="window.app.fillChat('How much CO2 have I saved?')">How much CO2 have I saved?</button>
            <button class="chip" onclick="window.app.fillChat('What\\'s my current streak?')">What's my current streak?</button>
            <button class="chip" onclick="window.app.fillChat('How does matching work?')">How does matching work?</button>
        </div>

        <div id="chat-messages" class="chat-messages" style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: #FAF7F2;">
            <div class="chat-bubble assistant">
                Hi! I'm the GreenLoop Assistant. I can help with plant care questions or check the status of your active compost matches. How can I help you today?
            </div>
        </div>

        <div class="chat-input-area" style="padding: 15px 20px; background: #FFFFFF; border-top: 1px solid var(--glass-border); display: flex; gap: 10px; align-items: center; position: sticky; bottom: 0;">
            <input type="file" id="chat-camera-input" accept="image/*" capture="environment" style="display: none;" onchange="window.app.handleChatImageUpload(event)">
            <input type="file" id="chat-gallery-input" accept="image/*" style="display: none;" onchange="window.app.handleChatImageUpload(event)">
            
            <div style="position: relative;">
                <button onclick="window.app.toggleChatAttachMenu()" style="background: transparent; border: none; color: var(--text-light); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </button>
                <div id="chat-attach-menu" style="display: none; position: absolute; bottom: 100%; left: 0; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding: 8px; margin-bottom: 8px; width: max-content; z-index: 10;">
                    ${!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? '' : `
                    <button onclick="document.getElementById('chat-camera-input').click(); window.app.toggleChatAttachMenu();" style="display: block; width: 100%; text-align: left; padding: 10px 15px; border: none; background: transparent; cursor: pointer; border-radius: 8px;">
                        📷 Take Photo
                    </button>
                    `}
                    <button onclick="document.getElementById('chat-gallery-input').click(); window.app.toggleChatAttachMenu();" style="display: block; width: 100%; text-align: left; padding: 10px 15px; border: none; background: transparent; cursor: pointer; border-radius: 8px;">
                        🖼️ Choose from Gallery
                    </button>
                </div>
            </div>
            
            <input type="text" id="chat-input" placeholder="Type your message..." style="flex: 1; padding: 12px 15px; border-radius: 20px; border: 1px solid var(--border-color); background: #FAF7F2; font-size: 1rem; outline: none;" onkeypress="if(event.key === 'Enter') window.app.submitChat()">
            <button onclick="window.app.submitChat()" style="background: var(--primary-green); color: white; border: none; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(45, 90, 61, 0.25);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
    </div>
    `;
}
