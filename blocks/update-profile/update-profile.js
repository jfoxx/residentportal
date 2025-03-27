export default function decorate(block) {
  const profile = {};
  ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'].forEach((property) => {
    if (window.localStorage.getItem(property)) {
      profile[property] = window.localStorage.getItem(property);
    } else {
      profile[property] = 'Not Provided';
    }
  });
  const currProfile = document.createElement('div');
  currProfile.classList.add('current-profile');
  currProfile.innerHTML = `
      <div class="profile">
        <div class="profile-header">
          <a href="#update-profile" class="button">Edit</a>
        </div>
        <div class="profile-content">
          <div class="profile-row">
            <div class="profile-label">Name</div>
            <div class="profile-value">${profile.firstName} ${profile.lastName}</div>
          </div>
          <div class="profile-row">
            <div class="profile-label">Email</div>
            <div class="profile-value">
                 ${profile.email}</div>
                 </div>
                 <div class="profile-row">
                 <div class="profile-label">Phone</div>
                 <div class="profile-value">${profile.phone}</div>
                 </div>
                 <div class="profile-row">
                 <div class="profile-label">Address</div>
                 <div class="profile-value">${profile.address}</div>
                 </div>
                 <div class="profile-row">
                 <div class="profile-label">City</div>
                 <div class="profile-value">${profile.city}</div>
                 </div>
                 <div class="profile-row">
                 <div class="profile-label">State</div>
                 <div class="profile-value">${profile.state}</div>
                 </div>
                 <div class="profile-row">
                 <div class="profile-label">Zip</div>
                 <div class="profile-value">${profile.zip}</div>
                 </div>
                 </div>`;
  block.append(currProfile);
}
