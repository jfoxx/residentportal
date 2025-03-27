import ffetch from '../../scripts/ffetch.js';

const allusers = await ffetch('/admin/users.json').all();
function findUser(arr, query) {
  return arr.filter((el) => el.username === query);
}

function handleLogin() {
  const form = document.querySelector('#static-signin-form');
  const username = form.querySelector('input[name=username]').value;
  const userMatch = findUser(allusers, username);
  if (userMatch.length > 0) {
    form.classList.add('submitting');
    localStorage.setItem('username', userMatch[0].username);
    localStorage.setItem('firstName', userMatch[0].firstName);
    localStorage.setItem('lastName', userMatch[0].lastName);
    localStorage.setItem('email', userMatch[0].email);
    localStorage.setItem('alerts', userMatch[0].alerts);

    setTimeout(() => {
      window.location = '/';
    }, '2000');
  } else {
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.innerText = 'User does not match';
    form.prepend(errorMessage);
  }
}

function createSignInForm(block) {
  const formContainer = document.createElement('div');
  formContainer.id = 'static-signin-form';
  formContainer.className = 'panel pure-form pure-form-aligned';

  formContainer.innerHTML = `
        <div class="pure-control-group">
            <label for="username">Username</label>
            <input name="username" type="email" autocomplete="username">
        </div>
        <div class="pure-control-group">
            <label for="password">Password</label>
            <input name="password" type="password" autocomplete="password">
        </div>
        <div class="pure-controls">
            <p><a href="/" data-se="recover-password" onclick="_showRecoverPassword(event)">Forgot your password?</a></p>
            <button class="button" >Sign In</button>
        </div>
    `;

  block.appendChild(formContainer);

  const submitButton = formContainer.querySelector('button');
  submitButton.addEventListener('click', handleLogin);
}

export default function decorate(block) {
  block.textContent = '';
  createSignInForm(block);
}
