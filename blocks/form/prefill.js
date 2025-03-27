import { checkLoginStatus } from '../../scripts/scripts.js';

export default function prefillForm() {
  if (checkLoginStatus()) {
    const forms = document.querySelectorAll('form');

    const profile = {};
    ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'username'].forEach((property) => {
      if (window.localStorage.getItem(property)) {
        profile[property] = window.localStorage.getItem(property);
      } else {
        profile[property] = '';
      }
    });

    if (forms) {
      forms.forEach((form) => {
        const emailField = form.querySelector('input[type="email"]');
        if (emailField) {
          emailField.value = profile.email;
        }
        const firstNameField = form.querySelector('input[name="firstName"]');
        if (firstNameField) {
          firstNameField.value = profile.firstName;
        }
        const lnameField = form.querySelector('input[name="lname"]');
        if (lnameField) {
          lnameField.value = profile.lastName;
        }
        const phoneField = form.querySelector('input[type="tel"]');
        if (phoneField) {
          phoneField.value = profile.phone;
        }
        const addressField = form.querySelector('input[name="address"]');
        if (addressField) {
          addressField.value = profile.address;
        }
        const cityField = form.querySelector('input[name="city"]');
        if (cityField) {
          cityField.value = profile.city;
        }
        const stateField = form.querySelector('input[name="state"]');
        if (stateField) {
          stateField.value = profile.state;
        }
        const zipField = form.querySelector('input[name="zip"]');
        if (zipField) {
          zipField.value = profile.zip;
        }
        const usernameField = form.querySelector('input[name="username"]');
        if (usernameField) {
          usernameField.value = profile.username;
        }
      });
    }
  }
}
