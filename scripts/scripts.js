import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

export function checkLoginStatus() {
  if (localStorage.getItem('firstName')) {
    return true;
  }
  return false;
}

function overrideFormSubmit(form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.createElement('div');
    message.innerHTML = 'Your request has been submitted. <a href="/">Return home</a>';
    form.replaceWith(message);
    window.localStorage.setItem('activeRequests', JSON.stringify({
      title: 'Toll Dispute',
      status: {
        percentage: 5,
        description: 'In Progress',
      },
    }));
  });
}

function updateProfile() {
  const form = document.querySelector('#update-profile form');
  const button = form.querySelector('button');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const profile = {};
    ['firstName', 'lastName', 'email', 'phone', 'state'].forEach((property) => {
      const input = form.querySelector(`*[name="${property}"]`);
      console.log(input.value);
      if (input.value) {
        profile[property] = input.value;
        window.localStorage.setItem(property, input.value);
      }
    });
    window.location = window.location.pathname;
  });
}

function initModals() {
  const modals = document.querySelectorAll('.section[data-modal]');
  const body = document.querySelector('body');
  const backdrop = document.createElement('div');
  backdrop.classList.add('modal-backdrop');
  modals.forEach((modal) => {
    modal.id = modal.getAttribute('data-modal-id');
    const trigger = document.querySelector(`a[href="#${modal.id}"]`);
    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'Close';
    closeButton.classList.add('close');
    modal.prepend(closeButton);
    trigger.addEventListener('click', () => {
      modal.classList.add('open');
      body.classList.add('modal-open');
      body.append(backdrop);
    });
    closeButton.addEventListener('click', () => {
      modal.classList.remove('open');
      body.classList.remove('modal-open');
      body.removeChild(backdrop);
    });
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        modal.classList.remove('open');
        body.classList.remove('modal-open');
        body.removeChild(backdrop);
      }
    });
  });
}

/**
 * Loads a non module JS file.
 * @param {string} src URL to the JS file
 * @param {Object} attrs additional optional attributes
 */
export async function loadScript(src, attrs) {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`head > script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      if (attrs) {
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const attr in attrs) {
          script.setAttribute(attr, attrs[attr]);
        }
      }
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    } else {
      resolve();
    }
  });
}

/**
 * Builds two column grid.
 * @param {Element} main The container element
 */
function buildLayoutContainer(main) {
  main.querySelectorAll(':scope > .section[data-layout]').forEach((section) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('layout-wrapper');
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left-column');
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right-column');
    let current = leftDiv;
    [...section.children].forEach((child) => {
      if (child.classList.contains('column-separator-wrapper')) {
        current = rightDiv;
        child.remove();
        return;
      }
      current.append(child);
    });
    wrapper.append(leftDiv, rightDiv);
    section.append(wrapper);
  });
}

/**
 * overlays icon to make it an image mask instead of an img.
 * @param {Element, String, String} span The icon span element
 */
function decorateIcon(span, prefix = '') {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);
  const iconPath = `${window.hlx.codeBasePath}${prefix}/icons/${iconName}.svg`;
  span.style.maskImage = `url(${iconPath})`;
}

/**
 * Add <img> for icons, prefixed with codeBasePath and optional prefix.
 * @param {Element} [element] Element containing icons
 * @param {string} [prefix] prefix to be added to icon the src
 */
function decorateIcons(element, prefix = '') {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    decorateIcon(span, prefix);
  });
}

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    buildLayoutContainer(main);
    if (checkLoginStatus()) {
      document.body.classList.add('logged-in');
    }
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  initModals();

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));

  if (document.querySelector('#update-profile form')) {
    updateProfile();
  }

  if (document.querySelector('form[data-formpath="/content/forms/af/washington/toll-dispute/jcr:content/guideContainer"]')) {
    document.querySelectorAll('form[data-formpath="/content/forms/af/washington/toll-dispute/jcr:content/guideContainer"]').forEach((form) => overrideFormSubmit(form));
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());
