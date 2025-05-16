import { getEndpoint } from '../../scripts/scripts.js';

const randomNumber = Math.floor(Math.random() * 1000);
const endpoint = `${getEndpoint()}/getAllServices?${randomNumber}`;

function loopProperty(property) {
  const arr = [];
  property.forEach((i) => {
    const tag = i.split('/');
    arr.push(tag.pop());
  });
  return arr.join(' ');
}

function selectAll() {
  const checkboxes = document.querySelectorAll('.service-list input[type=checkbox]');
  const button = document.querySelector('.eligible-services-actions button:first-of-type');
  if (button.classList.contains('selected')) {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    button.classList.remove('selected');
  } else {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
    button.classList.add('selected');
  }
}

function saveFavorites() {
  const button = document.querySelector('.eligible-services-actions button:last-of-type');
  const block = document.querySelector('.eligible-services-container');
  button.classList.add('saved');
  const checkboxes = document.querySelectorAll('.service-list input[type=checkbox]:checked');
  let favorites = [];
  if (localStorage.getItem('savedServices')) {
    favorites = JSON.parse(localStorage.getItem('savedServices'));
  }
  checkboxes.forEach((checkbox) => {
    favorites.push(checkbox.value);
  });
  localStorage.setItem('savedServices', JSON.stringify(favorites));
  let url = new URL(`${window.location.origin}${window.location.pathname}`);
  if (block.getAttribute('data-redirect')) {
    url = `/${block.getAttribute('data-redirect')}`;
    console.log(url);
  }
  window.location = url;
}

function showHiddenContent(id) {
  const panel = document.querySelector(`[data-show-id="${id}"]`);
  panel.classList.add('is-visible');
  window.scrollTo({
    top: panel.offsetTop,
    behavior: 'smooth',
  });
}

function activateDeferredAlerts() {
  const deferredAlertsRaw = localStorage.getItem('deferredAlerts');
  const alertsRaw = localStorage.getItem('alerts');

  // Parse both values or default to empty arrays
  const deferredAlerts = deferredAlertsRaw ? JSON.parse(deferredAlertsRaw) : [];
  const alerts = alertsRaw ? JSON.parse(alertsRaw) : [];

  if (Array.isArray(deferredAlerts) && deferredAlerts.length > 0) {
    const updatedAlerts = [...deferredAlerts, ...alerts];

    // Save the updated alerts array
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));

    // Optionally clear deferredAlerts
    localStorage.removeItem('deferredAlerts');
  }
}

function createSubmittedServicesList(services) {
  const ul = document.createElement('ul');
  ul.classList.add('submitted-services-list');
  services.forEach((service) => {
    const li = document.createElement('li');
    li.textContent = service.title;
    ul.appendChild(li);
  });
  return ul;
}

function applyForServices() {
  // Parse existing value
  const stored = JSON.parse(localStorage.getItem('activeRequests'));

  // Normalize to an array
  let existing;
  if (Array.isArray(stored)) {
    existing = stored;
  } else if (stored) {
    existing = [stored];
  } else {
    existing = [];
  }

  // Create a Set of existing titles to avoid duplicates
  const existingTitles = new Set(existing.map((req) => req.title));

  // Select all checked services
  const services = document.querySelectorAll('.service-list li:has(input:checked)');

  const newRequests = [];

  services.forEach((service) => {
    const titleElement = service.querySelector('.title');
    if (titleElement) {
      const title = titleElement.textContent.trim();

      if (!existingTitles.has(title)) {
        newRequests.push({
          title,
          status: {
            percentage: 5,
            description: 'In Progress',
          },
        });
      }
    }
  });

  // Combine and save
  const updatedRequests = [...existing, ...newRequests];
  localStorage.setItem('activeRequests', JSON.stringify(updatedRequests));
  const targetDiv = document.querySelector('[data-show-id="thanks-message"]');
  // eslint-disable-next-line no-template-curly-in-string
  const targetP = Array.from(targetDiv.querySelectorAll('p')).find((p) => p.textContent.includes('${services}'));
  if (!targetP) return;
  // eslint-disable-next-line no-template-curly-in-string
  targetP.innerHTML = targetP.innerHTML.replace('${services}', createSubmittedServicesList(newRequests).outerHTML);
  activateDeferredAlerts();
}

function filterResults() {
  const results = document.querySelectorAll('.service-list li');
  const container = document.querySelector('.eligible-services-container');
  const form = container.querySelector('form');

  ['income', 'military', 'employment'].forEach((i) => {
    const checked = form.querySelectorAll(`input[name=${i}-option]:checked`);
    if (checked.length > 0) {
      const checkbox = form.querySelector(`input[name=${i}-option]:checked`).value;
      results.forEach((result) => {
        if (result.dataset[i].includes(checkbox)) {
          result.classList.add('match');
        } else {
          result.classList.add('unmatch');
        }
      });
    }
  });

  const unmatched = document.querySelectorAll('.service-list li.unmatch');
  unmatched.forEach((i) => {
    i.parentElement.removeChild(i);
  });

  const button = form.querySelector('button');
  button.classList.add('submitting');

  setTimeout(() => {
    container.classList.add('flipped');
    container.scrollTop = 0;
  }, '2000');
}

function filterResultsById() {
  const resultsBlock = document.querySelector('.eligible-services-container');
  const results = resultsBlock.querySelectorAll('.service-list li');
  const panelId = resultsBlock.getAttribute('data-panel-id');
  const formContainer = document.querySelector(`[data-panel-target="${panelId}"]`);
  const form = formContainer.querySelector('form');
  const fieldset = form.querySelector('#services');
  const checkboxes = fieldset.querySelectorAll('input[type=checkbox]:checked');
  checkboxes.forEach((checkbox) => {
    const id = checkbox.value;
    if (id.includes(',')) {
      const ids = id.split(',');
      ids.forEach((i) => {
        results.forEach((result) => {
          if (result.id === `serviceid-${i}`) {
            result.classList.add('match');
          } else {
            result.classList.add('unmatch');
          }
        });
      });
    } else {
      results.forEach((result) => {
        if (result.id === `serviceid-${id}`) {
          result.classList.add('match');
        } else {
          result.classList.add('unmatch');
        }
      });
    }
  });

  const unmatched = document.querySelectorAll('.service-list li:not(.match)');
  unmatched.forEach((i) => {
    i.parentElement.removeChild(i);
  });

  setTimeout(() => {
    resultsBlock.scrollTop = 0;
  }, '2000');

  const button = document.querySelector('.eligible-services a.button');
  button.addEventListener('click', (e) => {
    e.preventDefault();
    applyForServices();
    button.classList.add('submitting');

    setTimeout(() => {
      resultsBlock.classList.remove('is-visible');
      resultsBlock.scrollTop = 0;
      showHiddenContent('thanks-message');
    }, '2000');
  });
}

async function fetchAndDisplayServices(target) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const services = data.data?.governmentServiceList?.items || [];
    const ul = document.createElement('ul');
    ul.classList.add('service-list');

    services.forEach((service) => {
      const li = document.createElement('li');
      li.id = `serviceid-${service.serviceId}`;
      if (service.income) { li.dataset.income = loopProperty(service.income); }
      if (service.military) { li.dataset.military = loopProperty(service.military); }
      if (service.employment) { li.dataset.employment = loopProperty(service.employment); }
      if (service.keywords) { li.dataset.keywords = service.keywords; }
      const a = document.createElement('a');
      a.href = service.link || '#';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = service.serviceId;
      checkbox.name = 'service';
      const titleSpan = document.createElement('span');
      titleSpan.className = 'title';
      titleSpan.textContent = service.title || 'No Title';

      const descriptionSpan = document.createElement('span');
      descriptionSpan.className = 'description';
      descriptionSpan.textContent = service.description.plaintext || 'No Description';

      a.append(checkbox, titleSpan, descriptionSpan);
      li.appendChild(a);
      ul.appendChild(li);
    });

    target.appendChild(ul);
  } catch (error) {
    console.error('Error fetching and displaying services:', error);
  }
}

export default function decorate(block) {
  fetchAndDisplayServices(block);
  const action = document.createElement('div');
  action.classList.add('eligible-services-actions');
  const selectButton = document.createElement('button');
  selectButton.textContent = 'Select All';
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save to My Services';
  action.append(selectButton, saveButton);
  block.prepend(action);
  selectButton.addEventListener('click', selectAll);
  saveButton.addEventListener('click', saveFavorites);
  const form = document.querySelector('[data-post-block="eligible-services"] form');
  const submitButton = form.querySelector('button');
  if (block.classList.contains('by-id')) {
    submitButton.addEventListener('click', filterResultsById);
  } else {
    submitButton.addEventListener('click', filterResults);
  }
}
