// Your script here.
const voiceSelect = document.getElementById('voiceSelect');
const rateEl = document.getElementById('rate');
const pitchEl = document.getElementById('pitch');
const textEl = document.getElementById('text');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');

let voices = [];

function populateVoiceList() {
  voices = speechSynthesis.getVoices().sort((a, b) => a.name.localeCompare(b.name));
  voiceSelect.innerHTML = '';

  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — default' : ''}`;
    option.setAttribute('data-name', voice.name);
    option.setAttribute('data-lang', voice.lang);
    voiceSelect.appendChild(option);
  });

  const preferred = voices.find(v => /rishi/i.test(v.name) && /en-?in/i.test(v.lang));
  if (preferred) {
    voiceSelect.selectedIndex = voices.indexOf(preferred);
  } else {
    const enIN = voices.find(v => /en-?in/i.test(v.lang));
    if (enIN) {
      voiceSelect.selectedIndex = voices.indexOf(enIN);
    }
  }
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

populateVoiceList();

function speak() {
  if (!('speechSynthesis' in window)) {
    alert('Sorry — your browser does not support Speech Synthesis.');
    return;
  }

  speechSynthesis.cancel();
  const text = textEl.value.trim();
  if (!text) return;

  const utterThis = new SpeechSynthesisUtterance(text);
  const selectedOption = voiceSelect.selectedOptions[0];
  if (selectedOption) {
    const name = selectedOption.getAttribute('data-name');
    const voice = voices.find(v => v.name === name);
    if (voice) utterThis.voice = voice;
  }

  utterThis.rate = parseFloat(rateEl.value);
  utterThis.pitch = parseFloat(pitchEl.value);

  speakBtn.disabled = true;
  speakBtn.textContent = 'Speaking...';

  utterThis.onend = () => {
    speakBtn.disabled = false;
    speakBtn.textContent = 'Speak';
  };

  utterThis.onerror = (e) => {
    console.error('Speech error', e);
    speakBtn.disabled = false;
    speakBtn.textContent = 'Speak';
  };

  speechSynthesis.speak(utterThis);
}

speakBtn.addEventListener('click', speak);

stopBtn.addEventListener('click', () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    speakBtn.disabled = false;
    speakBtn.textContent = 'Speak';
  }
});

textEl.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    speak();
  }
});

rateEl.addEventListener('input', () => rateEl.title = rateEl.value);
pitchEl.addEventListener('input', () => pitchEl.title = pitchEl.value);

setTimeout(() => {
  if (speechSynthesis.getVoices().length) populateVoiceList();
}, 500);
