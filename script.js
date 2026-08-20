// ============================================
// ETNA ESCAPE GAME v2 - JavaScript Logic
// ============================================

// Global variables
let startTime = null;
let timerInterval = null;
let gameWon = false;

// ============================================
// TIMER FUNCTIONALITY (compte a rebours)
// ============================================

// Duree totale de la partie : 60 minutes
const GAME_DURATION_MS = 60 * 60 * 1000;

function getRemainingMs() {
  if (startTime === null) return GAME_DURATION_MS;
  return Math.max(0, GAME_DURATION_MS - (Date.now() - startTime));
}

function renderTimer(timerElement) {
  const remaining = getRemainingMs();
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Passage en rouge sur les 5 dernieres minutes
  if (remaining <= 5 * 60000) {
    timerElement.classList.add('timer-critical');
  }

  return remaining;
}

function initTimer() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;

  if (!sessionStorage.getItem('escapeGameStartTime')) {
    sessionStorage.setItem('escapeGameStartTime', Date.now().toString());
  }

  startTime = parseInt(sessionStorage.getItem('escapeGameStartTime'));

  if (renderTimer(timerElement) === 0) {
    triggerGameOver();
    return;
  }

  timerInterval = setInterval(() => {
    if (renderTimer(timerElement) === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      triggerGameOver();
    }
  }, 1000);
}

// ============================================
// GAME OVER (temps ecoule)
// ============================================

const GAMEOVER_TEXT = 'VOTRE INSCRIPTION EST ANNULÉE';
const GLITCH_CHARS = '!<>-_\\/[]{}=+*^?#@$%&0123456789';

// Arrete le compte a rebours (appele en cas de victoire)
function stopGameTimer() {
  gameWon = true;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function triggerGameOver() {
  if (gameWon || document.getElementById('gameover-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'gameover-overlay';
  overlay.className = 'gameover-overlay';

  const warning = document.createElement('div');
  warning.className = 'gameover-warning';
  warning.textContent = 'TEMPS ÉCOULÉ';

  const skull = document.createElement('div');
  skull.className = 'gameover-skull';
  skull.textContent = '\u{1F480}';

  const message = document.createElement('div');
  message.className = 'gameover-message';
  message.textContent = GAMEOVER_TEXT;

  overlay.appendChild(warning);
  overlay.appendChild(skull);
  overlay.appendChild(message);
  document.body.appendChild(overlay);

  // Bloque le scroll et l'interaction avec la page derriere
  document.body.style.overflow = 'hidden';

  startGlitchText(message, GAMEOVER_TEXT);
}

// Corrompt aleatoirement quelques caracteres du texte, en boucle
function startGlitchText(element, text) {
  setInterval(() => {
    const chars = text.split('');
    const count = 1 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      const pos = Math.floor(Math.random() * chars.length);
      if (chars[pos] === ' ') continue;
      chars[pos] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }

    element.textContent = chars.join('');
  }, 120);
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

function typeWriter(element, text, speed = 30, callback = null) {
  let i = 0;

  // For boxes with HTML content, just fade them in
  if (element.classList.contains('warning-box') ||
      element.classList.contains('info-box') ||
      element.classList.contains('success-box') ||
      element.classList.contains('error-box')) {
    element.classList.add('typing');
    if (callback) callback();
    return;
  }

  // Normal typewriter for text elements
  element.innerHTML = '';
  element.classList.add('typing');

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }

  type();
}

function typeWriterMultiple(elements, speed = 30) {
  let currentIndex = 0;

  function typeNext() {
    if (currentIndex < elements.length) {
      const element = elements[currentIndex];
      const text = element.getAttribute('data-text') || element.textContent;

      if (!element.getAttribute('data-text')) {
        element.setAttribute('data-text', text);
      }

      typeWriter(element, text, speed, () => {
        currentIndex++;
        setTimeout(typeNext, 100);
      });
    } else {
      showDelayedElements();
    }
  }

  typeNext();
}

// Show elements that should appear after typewriter is done
function showDelayedElements() {
  const delayedElements = document.querySelectorAll('.delayed-text');
  let delay = 0;

  delayedElements.forEach((element) => {
    setTimeout(() => {
      element.classList.add('show');
    }, delay);
    delay += 300;
  });
}

// ============================================
// TEXT NORMALIZATION
// ============================================

function normalizeInput(str) {
  return str.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u0060\u00b4]/g, "'")
    .replace(/\s+/g, ' ');
}

// ============================================
// LETTRES COLLECTEES (V-O-L-C-A-N)
// ============================================

const LETTERS = ['V', 'O', 'L', 'C', 'A', 'N'];

function getFoundLetters() {
  const stored = sessionStorage.getItem('lettresFound');
  if (stored) return JSON.parse(stored);
  return { V: false, O: false, L: false, C: false, A: false, N: false };
}

function saveLetter(letter) {
  const found = getFoundLetters();
  found[letter] = true;
  sessionStorage.setItem('lettresFound', JSON.stringify(found));
}

function allLettersFound() {
  const found = getFoundLetters();
  return LETTERS.every(l => found[l]);
}

// ============================================
// FEEDBACK DISPLAY
// ============================================

function showCommandFeedback(message, type = 'info') {
  const feedback = document.createElement('div');
  feedback.className = 'terminal-output';
  feedback.style.marginTop = '12px';
  feedback.style.padding = '12px';
  feedback.style.borderRadius = '4px';
  feedback.style.animation = 'slideIn 0.3s ease';

  if (type === 'success') {
    feedback.style.background = 'rgba(137, 209, 133, 0.1)';
    feedback.style.borderLeft = '3px solid var(--success)';
    feedback.style.color = 'var(--success)';
  } else if (type === 'error') {
    feedback.style.background = 'rgba(244, 135, 113, 0.1)';
    feedback.style.borderLeft = '3px solid var(--error)';
    feedback.style.color = 'var(--error)';
  } else if (type === 'warning') {
    feedback.style.background = 'rgba(220, 220, 170, 0.1)';
    feedback.style.borderLeft = '3px solid var(--accent-yellow)';
    feedback.style.color = 'var(--accent-yellow)';
  } else {
    feedback.style.background = 'rgba(78, 201, 176, 0.1)';
    feedback.style.borderLeft = '3px solid var(--accent-green)';
    feedback.style.color = 'var(--accent-green)';
  }

  feedback.textContent = message;

  const commandInput = document.querySelector('[id*="commandInput"]');
  if (commandInput && commandInput.parentElement) {
    commandInput.parentElement.parentElement.insertBefore(feedback, commandInput.parentElement);
  }

  setTimeout(() => {
    feedback.remove();
  }, 3000);
}

// ============================================
// VALIDATION RESULT DISPLAY
// ============================================

// Fin d'enigme : on enregistre la lettre sans afficher de bandeau vert.
// C'est le message de Thomas qui annonce la victoire et donne la lettre.
function completeEnigme(resultDiv, letter) {
  resultDiv.innerHTML = '';
  saveLetter(letter);
}

function showErrorResult(resultDiv, message) {
  resultDiv.innerHTML = `
    <div class="error-box" style="animation: slideIn 0.5s ease;">
      <strong>&#10007; ${message}</strong>
    </div>
  `;
}

function showLoadingResult(resultDiv, message) {
  resultDiv.innerHTML = `<div class="terminal-output" style="color: var(--accent-yellow);">${message}<span class="loading-dots">...</span></div>`;
}

// ============================================
// TAP-TO-PLACE SYSTEM (replaces Drag & Drop)
// ============================================

let selectedFile = null;

function initTapToPlace() {
  const blocks = document.querySelectorAll('#source .block');
  const dropzones = document.querySelectorAll('.dropzone:not(#source)');

  // Tap on a file to select it
  blocks.forEach(block => {
    block.addEventListener('click', () => {
      selectFile(block);
    });
  });

  // Tap on a dropzone to place the selected file
  dropzones.forEach(zone => {
    zone.addEventListener('click', (e) => {
      if (!selectedFile) return;
      // Don't trigger if clicking on an already-placed block inside the zone
      if (e.target.closest('.block.correct')) return;
      placeFile(selectedFile, zone);
    });
  });
}

function selectFile(block) {
  // Deselect previous
  if (selectedFile) {
    selectedFile.classList.remove('selected');
  }

  // Select new (or deselect if same)
  if (selectedFile === block) {
    selectedFile = null;
    return;
  }

  selectedFile = block;
  block.classList.add('selected');
}

// Track which files have been placed in which folders
const placedFiles = new Map();

function placeFile(block, zone) {
  const paths = Array.from(block.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
  const zonePath = zone.getAttribute('data-path');

  if (paths.includes(zonePath)) {
    const zoneContent = zone.querySelector('.zone-content');

    if (paths.length > 1) {
      // File can go in multiple folders - clone it
      const clone = block.cloneNode(true);
      clone.classList.remove('selected');
      clone.classList.add('correct');
      clone.style.cursor = 'default';
      zoneContent.appendChild(clone);

      const fileId = block.getAttribute('data-id');
      markFileAsPlaced(fileId, zonePath);
    } else {
      // Single destination - move it
      block.classList.remove('selected');
      block.classList.add('correct');
      block.style.cursor = 'default';
      zoneContent.appendChild(block);
    }

    checkZoneCompletion(zone);
    checkGlobalCompletion();

    // Show positive feedback
    showDropFeedback(zone, true);
  } else {
    // Wrong folder
    showDropFeedback(zone, false);
  }

  // Deselect
  selectedFile.classList.remove('selected');
  selectedFile = null;
}

function markFileAsPlaced(fileId, path) {
  if (!placedFiles.has(fileId)) {
    placedFiles.set(fileId, new Set());
  }
  placedFiles.get(fileId).add(path);

  const originalBlock = document.querySelector(`#source [data-id="${fileId}"]`);
  if (originalBlock) {
    const allPaths = Array.from(originalBlock.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
    const placed = placedFiles.get(fileId);

    if (allPaths.every(p => placed.has(p))) {
      originalBlock.remove();
    }
  }
}

function checkZoneCompletion(zone) {
  const zonePath = zone.getAttribute('data-path');
  const expectedFiles = getExpectedFilesForZone(zonePath);
  const placed = zone.querySelectorAll('.block.correct');

  if (placed.length >= expectedFiles.length) {
    zone.classList.add('completed');
  }
}

function getExpectedFilesForZone(zonePath) {
  const allBlocks = document.querySelectorAll('.block[data-id]');
  const expected = [];

  allBlocks.forEach(block => {
    const paths = Array.from(block.querySelectorAll('.sous-texte')).map(el => el.textContent.trim());
    if (paths.includes(zonePath)) {
      expected.push(block.getAttribute('data-id'));
    }
  });

  return expected;
}

function checkGlobalCompletion() {
  const sourceBlocks = document.querySelectorAll('#source .block');

  if (sourceBlocks.length === 0) {
    const resultDiv = document.getElementById('result');
    if (resultDiv && !resultDiv.innerHTML.includes('Tous les fichiers')) {
      resultDiv.innerHTML = `
        <div class="success-box" style="animation: slideIn 0.5s ease; margin-top: 20px;">
          <strong>Tous les fichiers sont correctement rangés !</strong><br>
          Tapez "y" pour valider et obtenir votre lettre.
        </div>
      `;
    }
  }
}

function showDropFeedback(zone, success) {
  if (success) {
    zone.style.borderColor = 'var(--success)';
    zone.style.background = 'rgba(137, 209, 133, 0.1)';
  } else {
    zone.style.borderColor = 'var(--error)';
    zone.style.background = 'rgba(244, 135, 113, 0.1)';
  }

  setTimeout(() => {
    zone.style.borderColor = '';
    zone.style.background = '';
  }, 500);
}

// ============================================
// SYSTEM LOGS DISPLAY
// ============================================

function showSystemLogs(container, logs, callback) {
  if (!container) {
    if (callback) callback();
    return;
  }

  let logIndex = 0;

  function showNextLog() {
    if (logIndex < logs.length) {
      const log = logs[logIndex];
      const logElement = document.createElement('div');
      logElement.className = `system-log ${log.type}`;
      logElement.textContent = log.text;
      logElement.style.animationDelay = `${logIndex * 0.1}s`;

      container.appendChild(logElement);
      logIndex++;

      setTimeout(showNextLog, 400);
    } else {
      if (callback) callback();
    }
  }

  showNextLog();
}

// ============================================
// MODE (presentiel / distant)
// ============================================

function getGameMode() {
  return sessionStorage.getItem('gameMode') || 'presential';
}

function setGameMode(mode) {
  sessionStorage.setItem('gameMode', mode);
}

function isRemoteMode() {
  return getGameMode() === 'remote';
}

// Show/hide remote-only content blocks
function initModeContent() {
  const mode = getGameMode();

  document.querySelectorAll('.remote-only').forEach(el => {
    el.style.display = mode === 'remote' ? '' : 'none';
  });

  document.querySelectorAll('.presential-only').forEach(el => {
    el.style.display = mode === 'presential' ? '' : 'none';
  });
}

// ============================================
// HACKER TOAST NOTIFICATIONS
// ============================================

const hackerMessagesByEnigme = {
  'career-center': "Vous croyez vraiment pouvoir m'arrêter ?",
  'service-tech': "Je contrôle tout. Vos inscriptions, vos notes, tout.",
  'salle-serveur': "Abandonnez. Prenez une année sabbatique.",
  'service-peda': "Thomas ne peut pas vous aider. Il est dépassé.",
  'service-admin': "Tick tock... le temps tourne.",
  'co-labs': "Vous ne m'arrêterez pas."
};

function initHackerToasts() {
  const enigme = document.querySelector('[data-enigme]');
  if (!enigme) return;

  const msg = hackerMessagesByEnigme[enigme.getAttribute('data-enigme')];
  if (!msg) return;

  setTimeout(() => {
    showHackerToast(msg);
  }, 25000);
}

function showHackerToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'hacker-toast';
  toast.innerHTML = `<span class="hacker-toast-label">[INTRUS]</span> ${escapeHtml(msg)}`;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// THOMAS MESSAGES
// ============================================

function showThomasMessage(text, callback) {
  const existing = document.querySelector('.thomas-bubble');
  if (existing) existing.remove();

  const bubble = document.createElement('div');
  bubble.className = 'thomas-bubble';
  bubble.innerHTML = `
    <div class="thomas-header">Thomas Mauduit - Service Informatique</div>
    <div class="thomas-text"></div>
  `;

  document.body.appendChild(bubble);

  requestAnimationFrame(() => {
    bubble.classList.add('show');
  });

  // Typewriter effect in the bubble
  const textEl = bubble.querySelector('.thomas-text');
  typeWriter(textEl, text, 20, () => {
    if (callback) {
      setTimeout(callback, 1000);
    }
  });
}

function hideThomasMessage() {
  const bubble = document.querySelector('.thomas-bubble');
  if (bubble) {
    bubble.classList.remove('show');
    setTimeout(() => bubble.remove(), 300);
  }
}

// ============================================
// UTILITY
// ============================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initModeContent();

  // Start hacker toasts on enigme pages (not intro, not hub, not final)
  const isEnigmePage = document.querySelector('[data-enigme]');
  if (isEnigmePage) {
    initHackerToasts();
  }

  // Typewriter initialization
  const typewriterElements = document.querySelectorAll('.typewriter');
  if (typewriterElements.length > 0) {
    typeWriterMultiple(Array.from(typewriterElements), 20);
  }

  // Tap-to-place initialization
  if (document.getElementById('source')) {
    initTapToPlace();
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
