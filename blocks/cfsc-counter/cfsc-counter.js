export default function decorate(block) {
    const banner = document.createElement('div');
    const count = block.textContent;
    banner.classList.add('banner');
    const text = document.createElement('p');
    text.innerHTML = `It has been <span class="cal">${count}</span> days since the last consumer food safety incident.`;
    block.textContent = '';
    banner.appendChild(text);
    block.appendChild(banner);
}