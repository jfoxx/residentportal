export default function decorate(block) {
  const link = block.querySelector('a');
  const linktext = link.textContent;
  const span = document.createElement('span');
  span.className = 'link-text';
  span.textContent = linktext;
  link.replaceWith(span);
  const url = link.href;
  const child = block.querySelector('div');
  const wrapper = document.createElement('a');
  wrapper.href = url;
  wrapper.className = 'banner-link';
  wrapper.appendChild(child);
  block.textContent = '';
  block.appendChild(wrapper);
}
