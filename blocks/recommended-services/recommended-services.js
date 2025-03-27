async function fetchAndDisplayRecommendedServices(serviceId, target) {
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
    const img = document.createElement('img');
    // eslint-disable-next-line no-underscore-dangle
    img.src = `${service.image._dmS7Url}:square`;
    img.alt = service.title;
    img.className = 'service-image';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = service.title || 'No Title';
    const descriptionSpan = document.createElement('span');
    descriptionSpan.className = 'description';
    descriptionSpan.textContent = service.description.plaintext || 'No Description';
    link.append(img, titleSpan, descriptionSpan);
    target.appendChild(link);
  } catch (error) {
    console.error('Error fetching and displaying services:', error);
  }
}

function shuffleArray(array) {
  // eslint-disable-next-line no-plusplus
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  array.length = 4;
  return array;
}

export default function decorate(block) {
  const defaultServices = block.textContent.split(',').map((s) => s.trim());
  const relatedServices = window.localStorage.getItem('relatedServices');
  if (relatedServices) {
    defaultServices.push(...JSON.parse(relatedServices));
  }
  shuffleArray(defaultServices);
  const ul = document.createElement('ul');
  ul.classList.add('recommended-services-list');
  defaultServices.forEach((service) => {
    const li = document.createElement('li');
    fetchAndDisplayRecommendedServices(service, li);
    ul.appendChild(li);
    block.textContent = '';
    block.append(ul);
  });
}
