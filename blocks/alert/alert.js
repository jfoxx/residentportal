export default function decorate(block) {
  const textCell = block.querySelector('div > div');
  if (!textCell) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'alert-content';

  const icon = document.createElement('span');
  icon.className = 'alert-icon';
  icon.setAttribute('aria-hidden', 'true');

  const message = document.createElement('span');
  message.className = 'alert-message';
  message.innerHTML = textCell.innerHTML.trim();

  wrapper.append(icon, message);

  block.textContent = '';
  block.append(wrapper);
}
