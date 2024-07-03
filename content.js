let recognition = null;
let isListening = false;

// マイクボタンを作成する関数
function createMicButton() {
    const button = document.createElement('button');
    button.id = 'claude-mic-button';
    button.setAttribute('aria-label', 'Voice Input');
    button.className = 'inline-flex items-center justify-center relative shrink-0 ring-offset-2 ring-offset-bg-300 ring-accent-main-100 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:drop-shadow-none bg-[radial-gradient(ellipse,_var(--tw-gradient-stops))] from-bg-500/10 from-50% to-bg-500/30 border-0.5 border-border-400 font-medium font-styrene text-text-100/90 transition-colors active:bg-bg-500/50 hover:text-text-000 hover:bg-bg-500/60 h-8 w-8 rounded-md active:scale-95 !rounded-xl';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('stroke', '#ceccc5');
    path1.setAttribute('d', 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('stroke', '#ceccc5');
    path2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('stroke', '#ceccc5');
    line1.setAttribute('x1', '12');
    line1.setAttribute('y1', '19');
    line1.setAttribute('x2', '12');
    line1.setAttribute('y2', '23');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('stroke', '#ceccc5');
    line2.setAttribute('x1', '8');
    line2.setAttribute('y1', '23');
    line2.setAttribute('x2', '16');
    line2.setAttribute('y2', '23');

    svg.appendChild(path1);
    svg.appendChild(path2);
    svg.appendChild(line1);
    svg.appendChild(line2);

    button.appendChild(svg);

    return button;
}

// 音声認識を設定する関数
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error('Speech recognition is not supported in this browser.');
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = true;
    recognition.continuous = true;

    return recognition;
}

// テキストを挿入する関数
function insertText(text) {
    const contentEditableDiv = document.querySelector('div[contenteditable="true"]');
    if (contentEditableDiv) {
        let lastChild = contentEditableDiv.lastElementChild;
        if (!lastChild || lastChild.tagName !== 'P') {
            lastChild = document.createElement('p');
            contentEditableDiv.appendChild(lastChild);
        }
        lastChild.textContent += text;

        // カーソルを最後に移動
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentEditableDiv);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        contentEditableDiv.focus();
    }
}

// 音声認識を処理する関数
function handleSpeechRecognition(button) {
    if (!recognition) {
        recognition = setupSpeechRecognition();
        if (!recognition) return;

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                insertText(finalTranscript);
            }
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.start();
            } else {
                button.style.backgroundColor = '';
            }
        };
    }

    if (!isListening) {
        recognition.start();
        isListening = true;
        button.style.backgroundColor = 'rgb(171, 104, 255)';
    } else {
        recognition.stop();
        isListening = false;
        button.style.backgroundColor = '';
    }
}

// マイクボタンを挿入する関数
function insertMicButton() {
    const fileUploadButton = document.querySelector('[data-testid="file-upload"]');
    if (!fileUploadButton || document.getElementById('claude-mic-button')) {
        return;
    }

    const micButton = createMicButton();

    micButton.addEventListener('click', () => handleSpeechRecognition(micButton));

    fileUploadButton.insertAdjacentElement('afterend', micButton);
}

// DOMの変更を監視し、ファイルアップロードボタンが追加されたらマイクボタンを挿入する
const observer = new MutationObserver((mutations) => {
    if (!document.getElementById('claude-mic-button')) {
        const fileUploadButton = document.querySelector('[data-testid="file-upload"]');
        if (fileUploadButton) {
            insertMicButton();
            observer.disconnect();
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// 初期チェック
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertMicButton);
} else {
    insertMicButton();
}