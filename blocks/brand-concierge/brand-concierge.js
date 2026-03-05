async function fetchContent(path) {
  const url = path.endsWith('.plain.html') ? path : `${path}.plain.html`;
  const resp = await fetch(url);
  if (resp.ok) {
    return resp.text();
  }
  return null;
}

/** Find prompt key whose text best matches keywords in the question */
function findMatchingPromptKey(question, promptTexts) {
  const words = question.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    .filter((w) => w.length >= 2);
  if (words.length === 0) return null;

  let bestKey = null;
  let bestScore = 0;

  Object.entries(promptTexts).forEach(([promptKey, promptText]) => {
    const promptWords = promptText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const match = (w) => promptWords.some((pw) => pw.includes(w) || w.includes(pw));
    let score = words.filter(match).length;
    const keyAsWord = promptKey.toLowerCase();
    if (words.includes(keyAsWord)) score += 10;
    if (score > bestScore) {
      bestScore = score;
      bestKey = promptKey;
    }
  });

  return bestScore > 0 ? bestKey : null;
}

/** Split into two sections: main>div or body>div (plain.html structure) */
function splitContent(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  const container = main || doc.body;
  const divs = [...container.children].filter((el) => el.tagName === 'DIV');
  if (divs.length >= 2) {
    return [divs[0].innerHTML.trim(), divs[1].innerHTML.trim()];
  }
  return [html, ''];
}

function createLoaderHtml(questionText) {
  const q = (questionText || 'Loading...')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return `
    <div class="brand-concierge-overlay-question-pill">${q}</div>
    <div class="brand-concierge-overlay-loader-bubble">
      <span class="brand-concierge-overlay-loader-dot"></span>
      <span class="brand-concierge-overlay-loader-dot"></span>
      <span class="brand-concierge-overlay-loader-dot"></span>
    </div>
  `;
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'brand-concierge-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const backdrop = document.createElement('div');
  backdrop.className = 'brand-concierge-overlay-backdrop';

  const panel = document.createElement('div');
  panel.className = 'brand-concierge-overlay-panel';

  const header = document.createElement('div');
  header.className = 'brand-concierge-overlay-header';
  header.innerHTML = `
    <div class="brand-concierge-overlay-title">
      <span class="brand-concierge-overlay-title-text">Ask</span>
    </div>
    <button type="button" class="brand-concierge-overlay-close" aria-label="Close"></button>
  `;

  const content = document.createElement('div');
  content.className = 'brand-concierge-overlay-content';

  const inputSection = document.createElement('div');
  inputSection.className = 'brand-concierge-overlay-input-section';
  const overlayAskIcon = document.createElement('span');
  overlayAskIcon.className = 'brand-concierge-overlay-ask-icon';
  overlayAskIcon.setAttribute('aria-hidden', 'true');
  const overlayInput = document.createElement('input');
  overlayInput.type = 'text';
  overlayInput.className = 'brand-concierge-overlay-input';
  overlayInput.placeholder = 'Ask a question';
  const overlaySendBtn = document.createElement('button');
  overlaySendBtn.type = 'button';
  overlaySendBtn.className = 'brand-concierge-overlay-send';
  overlaySendBtn.setAttribute('aria-label', 'Send');
  inputSection.append(overlayAskIcon, overlayInput, overlaySendBtn);

  const disclaimer = document.createElement('p');
  disclaimer.className = 'brand-concierge-overlay-disclaimer';
  disclaimer.innerHTML = 'AI responses may be inaccurate, and any offers provided are non-binding. Check answers and sources. <a href="#">Terms</a>';

  panel.append(header, content, inputSection, disclaimer);
  overlay.append(backdrop, panel);

  return {
    overlay, backdrop, overlayInput, content, inputSection, sendBtn: overlaySendBtn,
  };
}

async function openOverlay(overlayState, promptKey, questionText) {
  const {
    overlay,
    content,
    overlayInput,
  } = overlayState;

  let resolvedKey = promptKey;
  let pathConfig = overlayState.promptConfig;
  if (promptKey === 'default' && questionText && overlayState.keywordsConfig) {
    const promptTexts = Object.fromEntries(
      Object.keys(overlayState.keywordsConfig).map((k) => [k, k]),
    );
    resolvedKey = findMatchingPromptKey(questionText, promptTexts) || 'default';
    pathConfig = overlayState.keywordsConfig;
  }

  const displayQuestion = questionText || (promptKey !== 'default' ? overlayState.lastCardText : '') || 'Loading...';

  content.innerHTML = createLoaderHtml(displayQuestion);
  overlayInput.value = '';
  overlayState.section2 = null;
  overlayState.section2Shown = false;

  document.body.appendChild(overlay);
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const path = pathConfig?.[resolvedKey];
  if (path) {
    const html = await fetchContent(path);
    if (html) {
      const [section1, section2] = splitContent(html);
      overlayState.section2 = section2;

      overlayState.contentTimeout = setTimeout(() => {
        if (!document.body.contains(overlay)) return;
        const q = (displayQuestion !== 'Loading...' ? displayQuestion : '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        const questionPill = q ? `<div class="brand-concierge-overlay-question-pill">${q}</div>` : '';
        content.innerHTML = `${questionPill}<div class="brand-concierge-overlay-section1">${section1}</div>`;
        if (section2) {
          const section2Div = document.createElement('div');
          section2Div.className = 'brand-concierge-overlay-section2';
          section2Div.hidden = true;
          section2Div.innerHTML = section2;
          content.appendChild(section2Div);
        }
      }, 2000);
    } else {
      content.innerHTML = '<p>Content could not be loaded.</p>';
    }
  } else {
    content.innerHTML = '<p>Content not configured for this prompt.</p>';
  }
}

function showSection2(overlayState) {
  const { content } = overlayState;
  const section2El = content.querySelector('.brand-concierge-overlay-section2');
  if (!section2El || overlayState.section2Shown) return;

  const loaderHtml = '<div class="brand-concierge-overlay-loader-bubble"><span class="brand-concierge-overlay-loader-dot"></span><span class="brand-concierge-overlay-loader-dot"></span><span class="brand-concierge-overlay-loader-dot"></span></div>';
  const loaderWrap = document.createElement('div');
  loaderWrap.className = 'brand-concierge-overlay-loader-wrap';
  loaderWrap.innerHTML = loaderHtml;

  section2El.before(loaderWrap);

  overlayState.section2Timeout = setTimeout(() => {
    loaderWrap.remove();
    section2El.hidden = false;
    overlayState.section2Shown = true;
  }, 2000);
}

function closeOverlay(overlayState) {
  const { overlay } = overlayState;
  if (overlayState.contentTimeout) clearTimeout(overlayState.contentTimeout);
  if (overlayState.section2Timeout) clearTimeout(overlayState.section2Timeout);
  overlay.classList.remove('is-open');
  const handleTransitionEnd = (e) => {
    if (e.propertyName === 'opacity') {
      overlay.remove();
      document.body.style.overflow = '';
      overlay.setAttribute('aria-hidden', 'true');
    }
  };
  overlay.addEventListener('transitionend', handleTransitionEnd, { once: true });
}

export default async function decorate(block) {
  const rows = [...block.children];
  const title = rows[0]?.textContent?.trim() || '';
  const subtitle = rows[1]?.textContent?.trim() || '';

  const promptConfig = {};
  const keywordsConfig = {};
  try {
    const resp = await fetch('/admin/brand-concierge.json');
    if (resp.ok) {
      const json = await resp.json();
      const parsePromptsSheet = (sheet) => {
        const out = {};
        if (sheet?.data && Array.isArray(sheet.data)) {
          sheet.data.forEach(({ prompt, response }) => {
            if (prompt && response) out[prompt] = response;
          });
        }
        return out;
      };
      const parseKeywordsSheet = (sheet) => {
        const out = {};
        if (sheet?.data && Array.isArray(sheet.data)) {
          sheet.data.forEach(({ keyword, response }) => {
            if (keyword && response) out[keyword] = response;
          });
        }
        return out;
      };
      if (json[':type'] === 'multi-sheet') {
        Object.assign(promptConfig, parsePromptsSheet(json.data));
        Object.assign(keywordsConfig, parseKeywordsSheet(json.keywords));
      } else {
        Object.assign(promptConfig, parsePromptsSheet(json));
      }
    }
  } catch {
    // Config not available, overlay will show fallback message
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'brand-concierge-content';

  const heading = document.createElement('h2');
  heading.className = 'brand-concierge-title';
  heading.textContent = title;

  const sub = document.createElement('p');
  sub.className = 'brand-concierge-subtitle';
  sub.textContent = subtitle;

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'brand-concierge-cards';

  const overlayState = createOverlay();
  overlayState.promptConfig = promptConfig;
  overlayState.keywordsConfig = keywordsConfig;
  const { overlay, backdrop } = overlayState;

  const hideOverlay = () => closeOverlay(overlayState);

  backdrop.addEventListener('click', hideOverlay);
  overlay.querySelector('.brand-concierge-overlay-close').addEventListener('click', hideOverlay);

  const handleOverlaySubmit = () => {
    const q = overlayState.overlayInput.value.trim();
    if (q) {
      showSection2(overlayState);
    }
  };
  overlayState.overlayInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleOverlaySubmit();
  });
  overlayState.sendBtn.addEventListener('click', handleOverlaySubmit);

  Object.entries(promptConfig).forEach(([promptText]) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'brand-concierge-card';
    const icon = document.createElement('span');
    icon.className = 'brand-concierge-card-icon';
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'brand-concierge-card-text';
    label.textContent = promptText;
    card.append(icon, label);
    card.addEventListener('click', () => {
      overlayState.lastCardText = promptText;
      openOverlay(overlayState, promptText, promptText);
    });
    cardsContainer.append(card);
  });

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'brand-concierge-input-wrapper';
  const askIcon = document.createElement('span');
  askIcon.className = 'brand-concierge-input-icon brand-concierge-ask-icon';
  askIcon.setAttribute('aria-hidden', 'true');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'brand-concierge-input';
  input.placeholder = 'Ask a question';
  const sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'brand-concierge-send';
  sendBtn.setAttribute('aria-label', 'Send');

  const handleSubmit = () => {
    const question = input.value.trim();
    openOverlay(overlayState, 'default', question);
    input.value = '';
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
  sendBtn.addEventListener('click', handleSubmit);
  inputWrapper.addEventListener('click', (e) => {
    if (e.target === inputWrapper || e.target === askIcon) input.focus();
  });

  inputWrapper.append(askIcon, input, sendBtn);

  wrapper.append(heading, sub, cardsContainer, inputWrapper);
  block.append(wrapper);
}
