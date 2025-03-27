import ffetch from '../../scripts/ffetch.js';

function excelSerialToDate(serial) {
  // Excel dates start from January 1, 1900
  const excelEpoch = new Date(1900, 0, 1);

  // Adjust for Excel's leap year bug (Excel considers 1900 as a leap year)
  const actualDate = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);

  // Format MM/DD/YYYY
  const mm = String(actualDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const dd = String(actualDate.getDate()).padStart(2, '0');
  const yyyy = actualDate.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

async function getMessages(user) {
  const messages = await ffetch('/admin/inbox.json').sheet(user).all();
  if (messages.length > 0) {
    const messageList = document.querySelector('ul.message-list');
    messages.forEach((m) => {
      const li = document.createElement('li');
      const action = document.createElement('span');
      action.className = 'message-action';
      action.innerHTML = '<button>X</button>';
      li.append(action);
      const from = document.createElement('span');
      from.innerText = m.From;
      li.append(from);
      const date = document.createElement('span');
      date.innerText = excelSerialToDate(m.Date);
      li.append(date);
      const subject = document.createElement('span');
      subject.innerText = m.Subject;
      li.append(subject);
      const message = document.createElement('span');
      message.innerText = m.Message;
      message.className = 'message-body';
      li.append(message);
      messageList.append(li);

      li.addEventListener('click', () => {
        li.classList.toggle('expanded');
      });
    });
  } else {
    const liEmpty = document.createElement('li');
    liEmpty.innerText = 'No messages';
    liEmpty.className = 'empty';
    document.querySelector('ul.message-list').append(liEmpty);
  }
}

export default function decorate(block) {
  const title = document.createElement('h3');
  title.innerText = 'Inbox';
  const ul = document.createElement('ul');
  ul.className = 'message-list';
  const li = document.createElement('li');
  li.className = 'message-header';
  ul.append(li);
  ['', 'From', 'Date', 'Subject'].forEach((h) => {
    const span = document.createElement('span');
    span.innerText = h;
    li.append(span);
  });
  block.innerText = '';
  block.append(title, ul);

  getMessages(localStorage.getItem('username'));
}
