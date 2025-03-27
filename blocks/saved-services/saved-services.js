async function fetchAndDisplaySavedServices(serviceId, target) {
  const randomNumber = Math.floor(Math.random() * 1000);
  try {
    const response = await fetch(`https://publish-p49252-e308251.adobeaemcloud.com/graphql/execute.json/warp/getServiceById;id=${serviceId}?${randomNumber}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const service = data.data?.governmentServiceList?.items[0];

    const link = document.createElement('a');
    link.href = service.link;
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = service.title || 'No Title';
    const descriptionSpan = document.createElement('span');
    descriptionSpan.className = 'description';
    descriptionSpan.textContent = service.description.plaintext || 'No Description';
    link.append(titleSpan);
    target.appendChild(link);
  } catch (error) {
    console.error('Error fetching and displaying services:', error);
  }
}

function getSavedServices(block) {
  const savedServices = localStorage.getItem('savedServices');
  if (savedServices !== '[]' && savedServices) {
    const ul = document.createElement('ul');
    ul.classList.add('saved-service-list');
    const services = JSON.parse(savedServices);
    services.forEach((service) => {
      const li = document.createElement('li');
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const updatedServices = services.filter((s) => s !== service);
        localStorage.setItem('savedServices', JSON.stringify(updatedServices));
        ul.removeChild(li);
      });
      li.appendChild(removeButton);
      fetchAndDisplaySavedServices(service, li);
      ul.appendChild(li);
      block.appendChild(ul);
    });
  } else {
    const noSavedServices = document.createElement('p');
    noSavedServices.textContent = 'No saved services';
    block.appendChild(noSavedServices);
  }
}

export default function decorate(block) {
  const title = document.createElement('h2');
  title.textContent = 'My Saved Services';
  block.appendChild(title);
  getSavedServices(block);
}
