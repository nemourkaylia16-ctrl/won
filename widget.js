(function() {
    // قراءة إعدادات العميل من data-* attributes
    const scriptTag = document.currentScript;
    const clientId = scriptTag.dataset.clientId;
    const language = scriptTag.dataset.language || 'ar';
    const theme = scriptTag.dataset.theme || 'light';
    const domain = scriptTag.dataset.domain || 'general';

    // رابط Webhook الخاص بك
    const webhookUrl = "https://marouass.app.n8n.cloud/webhook-test/19cfac5f-1486-49da-9073-fd2cfdbf4c23";

    // إنشاء أيقونة Chat
    const toggle = document.createElement('div');
    toggle.id = 'chat-toggle';
    toggle.innerText = '💬';
    toggle.style.position = 'fixed';
    toggle.style.bottom = '20px';
    toggle.style.right = '20px';
    toggle.style.background = '#2563eb';
    toggle.style.color = '#fff';
    toggle.style.width = '55px';
    toggle.style.height = '55px';
    toggle.style.borderRadius = '50%';
    toggle.style.display = 'flex';
    toggle.style.alignItems = 'center';
    toggle.style.justifyContent = 'center';
    toggle.style.fontSize = '24px';
    toggle.style.cursor = 'pointer';
    toggle.style.zIndex = '9999';
    document.body.appendChild(toggle);

    // إنشاء Widget الدردشة (مغلق عند البداية)
    const chatWidget = document.createElement('div');
    chatWidget.id = 'chat-widget';
    chatWidget.style.display = 'none';
    chatWidget.style.position = 'fixed';
    chatWidget.style.bottom = '90px';
    chatWidget.style.right = '20px';
    chatWidget.style.width = '320px';
    chatWidget.style.height = '420px';
    chatWidget.style.backgroundColor = theme === 'dark' ? '#222' : '#fff';
    chatWidget.style.borderRadius = '12px';
    chatWidget.style.boxShadow = '0 10px 30px rgba(0,0,0,.2)';
    chatWidget.style.display = 'flex';
    chatWidget.style.flexDirection = 'column';
    chatWidget.style.zIndex = '9999';
    document.body.appendChild(chatWidget);

    // رأس الدردشة
    const chatHeader = document.createElement('div');
    chatHeader.innerText = 'AI Assistant ✨';
    chatHeader.style.background = '#2563eb';
    chatHeader.style.color = '#fff';
    chatHeader.style.padding = '10px';
    chatHeader.style.textAlign = 'center';
    chatHeader.style.borderRadius = '12px 12px 0 0';
    chatWidget.appendChild(chatHeader);

    // صندوق الرسائل
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'chat-messages';
    messagesContainer.style.flex = '1';
    messagesContainer.style.padding = '10px';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.fontSize = '14px';
    chatWidget.appendChild(messagesContainer);

    // صندوق الإدخال
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.borderTop = '1px solid #ddd';
    chatWidget.appendChild(inputContainer);

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...';
    inputField.style.flex = '1';
    inputField.style.border = 'none';
    inputField.style.padding = '10px';
    inputContainer.appendChild(inputField);

    const sendBtn = document.createElement('button');
    sendBtn.innerText = language === 'ar' ? 'إرسال' : 'Send';
    sendBtn.style.border = 'none';
    sendBtn.style.padding = '0 15px';
    sendBtn.style.background = '#2563eb';
    sendBtn.style.color = '#fff';
    sendBtn.style.cursor = 'pointer';
    inputContainer.appendChild(sendBtn);

    // تبديل عرض الدردشة عند الضغط على الأيقونة
    toggle.onclick = () => {
        chatWidget.style.display = chatWidget.style.display === 'none' ? 'flex' : 'none';
    };

    // تخزين الجلسة مؤقتًا
    const sessionKey = `chat_${clientId}`;
    let chatSession = JSON.parse(localStorage.getItem(sessionKey)) || [];
    chatSession.forEach(msg => {
        addMessage(msg.text, msg.sender);
    });

    function saveMessage(text, sender){
        chatSession.push({ text, sender });
        localStorage.setItem(sessionKey, JSON.stringify(chatSession));
    }

    // إضافة رسالة للواجهة
    function addMessage(text, sender='user'){
        const msg = document.createElement('div');
        msg.innerText = text;
        msg.style.marginBottom = '8px';
        msg.style.textAlign = sender === 'user' ? 'right' : 'left';
        msg.style.background = sender === 'user' ? '#2563eb' : (theme === 'dark' ? '#444' : '#f1f1f1');
        msg.style.color = sender === 'user' ? '#fff' : (theme === 'dark' ? '#fff' : '#222');
        msg.style.padding = '6px 10px';
        msg.style.borderRadius = '8px';
        msg.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // إرسال الرسالة إلى n8n Webhook
    async function sendMessage(){
        const text = inputField.value.trim();
        if(!text) return;
        addMessage(text, 'user');
        saveMessage(text, 'user');
        inputField.value = '';

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    client_id: clientId,
                    language: language,
                    theme: theme,
                    domain: domain
                })
            });
            const data = await res.json();
            const reply = data.reply || (language === 'ar' ? "عذرًا، لم يصل الرد بعد." : "Sorry, no reply yet.");
            addMessage(reply, 'bot');
            saveMessage(reply, 'bot');
        } catch(err) {
            console.error(err);
            const errorMsg = language === 'ar' ? "حدث خطأ أثناء الإرسال." : "Error sending message.";
            addMessage(errorMsg, 'bot');
            saveMessage(errorMsg, 'bot');
        }
    }

    // إرسال عند الضغط على زر الإرسال
    sendBtn.addEventListener('click', sendMessage);

    // إرسال عند الضغط على Enter
    inputField.addEventListener('keydown', e => {
        if(e.key === 'Enter') sendBtn.click();
    });

})();
