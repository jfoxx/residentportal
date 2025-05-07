import {
  sampleRUM,
  loadHeader,
  loadFooter,
  buildBlock,
  decorateSections,
  decorateBlocks,
  decorateBlock,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlock,
  loadBlocks,
  loadCSS,
  getMetadata,
} from './aem.js';

import ffetch from './ffetch.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

export function checkLoginStatus() {
  if (localStorage.getItem('firstName')) {
    return true;
  }
  return false;
}

async function getColors() {
  const styles = await ffetch('/admin/styles.json').all();
  const styleBlock = document.createElement('style');
  let colors = '';
  styles.forEach((style) => {
    const color = style.key;
    const hex = style.value;
    if (color && hex) {
      colors += `${color}: ${hex};\n`;
    }
  });

  styleBlock.innerText = `:root { ${colors} }`;
  document.head.append(styleBlock);
}

export function getEndpoint() {
  const endpoint = `https://${getMetadata('serviceendpoint')}`;
  return endpoint;
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
 * Decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 */
function decorateButtons(element) {
  element.querySelectorAll('a:not(is-hidden)').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button'; // default
          up.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
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

  getColors();
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Load Adobe Target.
 */
function initATJS(path, config) {
  window.targetGlobalSettings = config;
  return new Promise((resolve) => {
    import(path).then(resolve);
  });
}

function onDecoratedElement(fn) {
  // Apply propositions to all already decorated blocks/sections
  if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
    fn();
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.target.tagName === 'BODY'
      || m.target.dataset.sectionStatus === 'loaded'
      || m.target.dataset.blockStatus === 'loaded')) {
      fn();
    }
  });
  // Watch sections and blocks being decorated async
  observer.observe(document.querySelector('main'), {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-block-status', 'data-section-status'],
  });
  // Watch anything else added to the body
  observer.observe(document.querySelector('body'), { childList: true });
}

function toCssSelector(selector) {
  return selector.replace(/(\.\S+)?:eq\((\d+)\)/g, (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`);
}

async function getElementForOffer(offer) {
  const selector = offer.cssSelector || toCssSelector(offer.selector);
  return document.querySelector(selector);
}

async function getElementForMetric(metric) {
  const selector = toCssSelector(metric.selector);
  return document.querySelector(selector);
}

function autoDecorateFragment(el) {
  const a = document.createElement('a');
  const href = el.getAttribute('data-fragment');
  a.href = href;
  a.className = 'at-element-marker';
  const fragmentBlock = buildBlock('fragment', a);
  el.replaceWith(fragmentBlock);
  decorateBlock(fragmentBlock);
  return loadBlock(fragmentBlock);
}

function observeAndDecorateBlocks() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-fragment')) {
          autoDecorateFragment(node);
        }
      });
    });
  });

  observer.observe(document.querySelector('main'), {
    childList: true,
    subtree: true,
  });
}

async function getAndApplyOffers() {
  const response = await window.adobe.target.getOffers({ request: { execute: { pageLoad: {} } } });
  const { options = [], metrics = [] } = response.execute.pageLoad;
  onDecoratedElement(() => {
    window.adobe.target.applyOffers({ response });
    // keeping track of offers that were already applied
    // eslint-disable-next-line no-return-assign
    options.forEach((o) => o.content = o.content.filter((c) => !getElementForOffer(c)));
    // keeping track of metrics that were already applied
    metrics.map((m, i) => (getElementForMetric(m) ? i : -1))
      .filter((i) => i >= 0)
      .reverse()
      .map((i) => metrics.splice(i, 1));
  });
}

let atjsPromise = Promise.resolve();
if (getMetadata('target')) {
  atjsPromise = initATJS('./at.js', {
    clientCode: 'demoonecloud',
    serverDomain: 'demoonecloud.tt.omtrdc.net',
    imsOrgId: 'E4961D746578144C0A495FC6@AdobeOrg',
    bodyHidingEnabled: false,
    cookieDomain: window.location.hostname,
    pageLoadEnabled: false,
    secureOnly: true,
    viewsEnabled: false,
    withWebGLRenderer: false,
  });
  document.addEventListener('at-library-loaded', () => {
    observeAndDecorateBlocks();
    getAndApplyOffers();
  });
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
    // wait for atjs to finish loading
    await atjsPromise;
    // show the LCP block in a dedicated frame to reduce TBT
    await new Promise((resolve) => {
      window.requestAnimationFrame(async () => {
        await waitForLCP(LCP_BLOCKS);
        resolve();
      });
    });
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
