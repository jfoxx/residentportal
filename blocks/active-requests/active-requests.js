export default function decorate(block) {
  block.textContent = ''; // Clear block contents

  const activeRequests = JSON.parse(window.localStorage.getItem('activeRequests')) || [];

  if (Array.isArray(activeRequests) && activeRequests.length > 0) {
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = 'Active Requests';
    block.appendChild(sectionTitle);

    const ul = document.createElement('ul');
    ul.classList.add('active-requests-list');

    // Add header row
    const headerLi = document.createElement('li');
    headerLi.classList.add('header');

    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'Request';
    headerLi.appendChild(headerTitle);

    const headerStatus = document.createElement('span');
    headerStatus.textContent = 'Status';
    headerLi.appendChild(headerStatus);

    ul.appendChild(headerLi);

    // Add each request as a list item
    activeRequests.forEach((req) => {
      const li = document.createElement('li');

      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = req.title || 'No Title';

      const status = document.createElement('span');
      status.className = 'status';
      status.textContent = req.status?.description || 'No Status';
      status.classList.add(`status-${req.status?.percentage || 0}`);

      li.append(title, status);
      ul.appendChild(li);
    });

    block.appendChild(ul);
  } else {
    // Optional: Show a message when no requests exist
    const message = document.createElement('p');
    message.className = 'no-requests-message';
    message.textContent = 'You have no active requests at this time.';
    block.appendChild(message);
  }
}
