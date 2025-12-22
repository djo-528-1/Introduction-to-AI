let messages = [
    { role: "system", content: "Вы полезный ассистент, отвечающий на вопросы пользователя кратко и по делу." }
];

document.getElementById('tempSlider').addEventListener('input', function() {
    document.getElementById('tempValueDisplay').textContent = this.value;
});


async function sendQuestion() {
    const inputElement = document.getElementById('questionInput');
    const userQuestion = inputElement.value.trim();

    if (!userQuestion) return;

    const temperature = parseFloat(document.getElementById('tempSlider').value);
    const maxLength = parseInt(document.getElementById('maxLengthInput').value);

    messages.push({ role: "user", content: userQuestion });
    displayMessage(userQuestion, 'user-message');
    inputElement.value = ''; 

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tinyllama', 
                messages: messages, 
                stream: false,
                options: {
                    temperature: temperature,
                    num_predict: maxLength
                }
            }),
        });

        if (!response.ok)
        {
            if (response.status === 404)
            {
                throw new Error(`Модель tinyllama не найдена. Выполните 'ollama pull tinyllama' в терминале`)
            }
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponseContent = data.message.content.trim();

        messages.push({ role: "assistant", content: aiResponseContent });
        displayMessage(aiResponseContent, 'ai-message');

    } catch (error) {
        displayMessage(`Ошибка: ${error.message}. Проверьте, запущен ли Ollama.`, 'error-message');
    }
}

function displayMessage(content, className) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
