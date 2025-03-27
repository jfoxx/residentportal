function dismissAlert() {
  const alert = this.closest('li');
  const alertText = alert.innerText;
  const currAlerts = localStorage.getItem('alerts').split('|');
  currAlerts.forEach((i) => {
    const lsText = i.toString().trim().replaceAll(' ', '');
    if (lsText === alertText.replaceAll(' ', '')) {
      if (currAlerts.length > 1) {
        currAlerts.splice(currAlerts.indexOf(i), 1);
        localStorage.setItem('alerts', currAlerts.join('|'));
      } else {
        localStorage.removeItem('alerts');
      }
    }
  });

  alert.parentNode.removeChild(alert);
}

export default function decorate(block) {
  const storedAlerts = localStorage.getItem('alerts');
  if (storedAlerts) {
    let alerts;
    if (storedAlerts.includes('|')) {
      alerts = storedAlerts.split('|');
    } else {
      alerts = [storedAlerts];
    }

    const alertList = document.createElement('ul');
    alerts.forEach((a) => {
      const li = document.createElement('li');
      li.innerText = a.toString();
      const dismiss = document.createElement('button');
      dismiss.className = 'dismiss';
      li.prepend(dismiss);
      alertList.append(li);
    });
    block.append(alertList);

    const buttons = document.querySelectorAll('.alerts ul li button');
    buttons.forEach((b) => {
      b.addEventListener('click', dismissAlert);
    });
  } else {
    block.parentNode.removeChild(block);
  }
}
