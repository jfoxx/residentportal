function dismissAlert() {
  const alertElement = this.closest('li');
  const alertText = alertElement.getAttribute('data-alert');

  let currAlerts = [];

  try {
    currAlerts = JSON.parse(localStorage.getItem('alerts')) || [];
  } catch (e) {
    console.error('Failed to parse alerts from localStorage', e);
    currAlerts = [];
  }

  const updatedAlerts = currAlerts.filter((a) => a.alert !== alertText);

  if (updatedAlerts.length > 0) {
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  } else {
    localStorage.removeItem('alerts');
  }

  alertElement.remove();
}

export default function decorate(block) {
  const storedAlerts = localStorage.getItem('alerts');

  if (storedAlerts) {
    let alerts;

    try {
      alerts = JSON.parse(storedAlerts);
      if (!Array.isArray(alerts)) alerts = [];
    } catch (e) {
      console.error('Invalid alert format in localStorage', e);
      alerts = [];
    }

    if (alerts.length > 0) {
      const alertList = document.createElement('ul');

      alerts.forEach(({ alert, link }) => {
        const li = document.createElement('li');
        li.setAttribute('data-alert', alert);

        const dismiss = document.createElement('button');
        dismiss.className = 'dismiss';

        const a = document.createElement('a');
        a.href = link || '#';
        a.textContent = alert;

        li.append(dismiss);
        li.append(a);
        alertList.append(li);
      });

      block.append(alertList);

      const buttons = block.querySelectorAll('ul li button.dismiss');
      buttons.forEach((b) => b.addEventListener('click', dismissAlert));
    } else {
      block.parentNode.removeChild(block);
    }
  } else {
    block.parentNode.removeChild(block);
  }
}
