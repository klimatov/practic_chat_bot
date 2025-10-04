const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let userName = "";
let numbers = [];
let state = "idle";
let typingShown = false;

userInput.addEventListener("input", () => {
    const hasText = userInput.value.trim() !== "";

    sendBtn.disabled = !hasText;
    sendBtn.classList.toggle("input-area__button--active", hasText);

    if (hasText && !typingShown) {
        showTypingPlaceholder();
        typingShown = true;
    } else if (!hasText && typingShown) {
        removeTypingPlaceholder();
        typingShown = false;
    }
});

sendBtn.addEventListener("click", doSend);

document.addEventListener('keydown', e => { if (e.key === 'Enter') { 
    doSend(); 
} });


function doSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    removeTypingPlaceholder();
    typingShown = false;

    showTyping(() => {
        handleCommand(text);
    });

    userInput.value = "";
    sendBtn.disabled = true;
    sendBtn.classList.remove("input-area__button--active");
}

function addMessage(text, sender = "bot") {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", `message--${sender}`);

    const avatar = document.createElement("img");
    avatar.src = sender === "user" ? "images/user_avatar.png" : "images/bot_avatar.png";
    avatar.classList.add("message__avatar");

    const bubble = document.createElement("div");
    bubble.classList.add("message__bubble");
    bubble.textContent = text;

    if (sender === "user") {
        messageEl.appendChild(bubble);
        messageEl.appendChild(avatar);
    } else {
        messageEl.appendChild(avatar);
        messageEl.appendChild(bubble);
    }

    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping(callback) {
    const typingEl = document.createElement("div");
    typingEl.classList.add("message", "message--bot");
    typingEl.id = "typing";

    const avatar = document.createElement("img");
    avatar.src = "images/bot_avatar.png";
    avatar.classList.add("message__avatar");

    const bubble = document.createElement("div");
    bubble.classList.add("message__bubble");

    const indicator = document.createElement("div");
    indicator.className = "typing-indicator";
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        indicator.appendChild(dot);
    }

    bubble.appendChild(indicator);
    typingEl.appendChild(avatar);
    typingEl.appendChild(bubble);

    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
        typingEl.remove();
        callback();
    }, 1000);
}

function showTypingPlaceholder() {
    if (document.getElementById("typing-placeholder")) return;

    const typingEl = document.createElement("div");
    typingEl.classList.add("message", "message--user");
    typingEl.id = "typing-placeholder";

    const avatar = document.createElement("img");
    avatar.src = "images/user_avatar.png";
    avatar.classList.add("message__avatar");

    const bubble = document.createElement("div");
    bubble.classList.add("message__bubble");

    const indicator = document.createElement("div");
    indicator.className = "typing-indicator typing-indicator--user";
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        indicator.appendChild(dot);
    }

    bubble.appendChild(indicator);
    typingEl.appendChild(bubble);
    typingEl.appendChild(avatar);

    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;
}

function removeTypingPlaceholder() {
    const typingEl = document.getElementById("typing-placeholder");
    if (typingEl) typingEl.remove();
}

function handleCommand(input) {
    if (input === "/start") {
        state = "awaiting_name";
        addMessage("Привет, меня зовут Чат-бот, а как зовут тебя?");
    } else if (input.startsWith("/name:")) {
        if (state !== "awaiting_name") {
            addMessage("Введите команду /start, для начала общения");
            return;
        }
        userName = input.split(":")[1].trim();
        state = "awaiting_numbers";
        addMessage(`Привет ${userName}, приятно познакомиться. Я умею считать, введи числа которые надо посчитать`);
    } else if (input.startsWith("/number:")) {
        if (state !== "awaiting_numbers") {
            addMessage("Введите команду /start, для начала общения");
            return;
        }
        const numStr = input.split(":")[1];
        numbers = numStr.split(",").map(n => parseFloat(n.trim()));
        if (numbers.length !== 2 || numbers.some(isNaN)) {
            addMessage("Неверный формат чисел. Введите два числа через запятую.");
            return;
        }
        state = "awaiting_operation";
        addMessage("Введите одно из действий: +, -, *, /");
    } else if (["+", "-", "*", "/"].includes(input)) {
        if (state !== "awaiting_operation") {
            addMessage("Сначала введите числа через /number: a, b");
            return;
        }
        let result;
        switch (input) {
            case "+": result = numbers[0] + numbers[1]; break;
            case "-": result = numbers[0] - numbers[1]; break;
            case "*": result = numbers[0] * numbers[1]; break;
            case "/": result = numbers[1] === 0 ? "Ошибка: деление на ноль" : numbers[0] / numbers[1]; break;
        }
        addMessage(`Результат: ${result}`);
        state = "awaiting_numbers";
    } else if (input === "/stop") {
        state = "idle";
        addMessage("Всего доброго, если хочешь поговорить пиши /start");
    } else {
        if (state === "idle") {
            addMessage("Введите команду /start, для начала общения");
        } else {
            addMessage("Я не понимаю, введите другую команду!");
        }
    }
}
