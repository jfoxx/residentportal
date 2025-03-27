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
  button.classList.add('saved');
  const checkboxes = document.querySelectorAll('.service-list input[type=checkbox]:checked');
  const favorites = [];
  checkboxes.forEach((checkbox) => {
    favorites.push(checkbox.value);
  });
  localStorage.setItem('savedServices', JSON.stringify(favorites));
  const url = new URL(`${window.location.origin}${window.location.pathname}`);
  window.location = url;
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

async function fetchAndDisplayServices(target, endpoint) {
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
  const randomNumber = Math.floor(Math.random() * 1000);
  fetchAndDisplayServices(block, `https://publish-p49252-e308251.adobeaemcloud.com/graphql/execute.json/warp/allServices?${randomNumber}`);
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
  const form = document.querySelector('.eligible-services-container form');
  const submitButton = form.querySelector('button');
  submitButton.addEventListener('click', filterResults);
}
