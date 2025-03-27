function handleSearch() {
  const field = document.querySelector('.search-field');
  let keyword = field.value;
  keyword = encodeURIComponent(keyword);
  const searchUrl = `/find-a-service?q=${keyword}`;
  window.location = searchUrl;
}

export default function decorate(block) {
  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search';
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'search-field';
  field.placeholder = 'Find a service';
  const button = document.createElement('button');
  button.className = 'search-button';
  button.innerText = 'GO';
  searchWrapper.append(field, button);
  block.append(searchWrapper);
  button.addEventListener('click', handleSearch);
}
