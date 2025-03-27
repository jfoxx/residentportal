export default function decorate(block) {
  block.textContent = '';
  const activeRequest = JSON.parse(window.localStorage.getItem('activeRequests')) || [];
  console.log(activeRequest);
  if (activeRequest.title) {
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = 'Active Requests';
    block.appendChild(sectionTitle);
    const ul = document.createElement('ul');
    ul.classList.add('active-requests-list');
    const headerLi = document.createElement('li');
    headerLi.classList.add('header');
    const headerTitle = document.createElement('span');
    headerTitle.textContent = 'Request';
    headerLi.appendChild(headerTitle);
    const headerStatus = document.createElement('span');
    headerStatus.textContent = 'Status';
    headerLi.appendChild(headerStatus);
    ul.appendChild(headerLi);
    const li = document.createElement('li');
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = activeRequest.title || 'No Title';
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = activeRequest.status.description || 'No Status';
    status.classList.add(`status-${activeRequest.status.percentage}`);
    li.append(title, status);
    ul.appendChild(li);

    block.appendChild(ul);
  } else {
    console.log('No active requests');
  }
}
