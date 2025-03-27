const randomNumber = Math.floor(Math.random() * 1000);

function getIcon(tag) {
  const units = tag.split('/');
  let icon = units[1].toString();
  icon = `${icon}.svg`;
  return icon;
}

function getAgency(tag) {
  const units = tag.split('agency/');
  let agency = units[1].toString();
  agency = agency.toLowerCase();
  return agency;
}

function getKeyword() {
  const queryString = window.location.search;
  if (queryString) {
    const params = new URLSearchParams(queryString);
    let query = params.get('q');
    query = decodeURI(query);
    return query;
  }
  return null;
}

function filterKeyword(keyword) {
  const blockedWords = ['my', 'the', 'for', 'a', 'and', 'i', 'an', 'to', 'of', 'in', 'on', 'with', 'by', 'at', 'from', 'as', 'or', 'is', 'it', 'be', 'are', 'you', 'your', 'our', 'we', 'us', 'they', 'them', 'he', 'she', 'his', 'her', 'their', 'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'how', 'why', 'what', 'which', 'who', 'whom', 'whose', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'done', 'doing', 'have', 'has', 'had', 'having', 'get', 'got', 'gotten', 'getting', 'make', 'made', 'making', 'take', 'took', 'taken', 'taking', 'come', 'came', 'coming', 'go', 'went', 'gone', 'going', 'see', 'saw', 'seen', 'seeing', 'look', 'looked', 'looking', 'find', 'found', 'finding', 'think', 'thought', 'thinking', 'know', 'knew', 'known', 'knowing', 'want', 'wanted', 'wanting', 'use', 'used', 'using', 'call', 'called', 'calling', 'try', 'tried', 'trying', 'need', 'needed', 'needing', 'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting', 'begin', 'began', 'beginning', 'start', 'started', 'starting', 'show', 'showed', 'shown', 'showing', 'hear', 'heard', 'hearing', 'talk', 'talked', 'talking', 'speak', 'spoke', 'spoken', 'speaking', 'read', 'reading', 'write', 'wrote', 'written', 'writing', 'remember', 'remembered', 'remembering', 'forget', 'forgot', 'forgotten', 'forgetting', 'give', 'gave', 'given', 'giving', 'buy', 'bought', 'buying', 'sell', 'sold', 'selling', 'pay', 'paid', 'paying', 'send', 'sent', 'sending', 'receive', 'received', 'receiving', 'build', 'built', 'created', 'creating', 'destroy', 'destroyed', 'destroying', 'eat', 'ate', 'eaten', 'eating', 'drink', 'drank', 'drunk', 'drinking', 'wear', 'wore', 'worn', 'wearing', 'sleep', 'slept', 'sleeping', 'live', 'lived', 'living', 'die', 'died', 'dying', 'kill', 'killed', 'killing', 'fight', 'fought', 'fighting', 'win', 'won', 'winning', 'lose', 'lost', 'losing', 'find', 'found', 'finding', 'think', 'thought', 'thinking', 'know', 'knew', 'known', 'knowing', 'want', 'wanted', 'wanting', 'use', 'used', 'using', 'call', 'called', 'calling', 'try', 'tried', 'trying', 'need', 'needed', 'needing', 'feel', 'felt', 'feeling', 'become', 'became', 'becoming', 'leave', 'left', 'leaving', 'put', 'putting', 'begin', 'began', 'beginning', 'start', 'started', 'starting', 'show', 'showed', 'shown', 'showing', 'hear', 'heard', 'hearing', 'talk', 'talked', 'talking', 'speak', 'spoke', 'spoken', 'speaking', 'read', 'reading', 'write', 'wrote', 'written', 'writing', 'remember', 'remembered', 'remembering', 'forget', 'forgot', 'forgotten', 'forgetting', 'give', 'gave', 'given', 'giving', 'buy', 'bought', 'buying', 'sell', 'sold', 'selling', 'pay', 'paid', 'paying', 'send', 'sent', 'sending', 'receive', 'received', 'receiving', 'build'];
  const results = document.querySelectorAll('.search-results ul li');
  const adjkeyword = keyword.toLowerCase();
  const keywordPieces = adjkeyword.split(' ').filter((piece) => !blockedWords.includes(piece));
  results.forEach((r) => {
    const myKeywords = r.getAttribute('data-keywords').replace(/,/g, '');
    const matchCount = new Map();
    if (myKeywords) {
      const myKeywordsPieces = myKeywords.trim().split(' ');
      keywordPieces.forEach((k) => {
        if (myKeywordsPieces.includes(k)) {
          matchCount.set(k, (matchCount.get(k) || 0) + 1);
        }
      });
    }
    r.setAttribute('data-match-count', matchCount.size);
  });
}

function loopProperty(property) {
  const arr = [];
  property.forEach((i) => {
    const tag = i.split('/');
    arr.push(tag.pop());
  });
  return arr.join(' ');
}

function filterResults() {
  const resultsParent = document.querySelector('.search-results ul');
  const results = document.querySelectorAll('.search-results ul li');
  const fields = document.querySelectorAll('select');
  resultsParent.classList.add('filtered');
  results.forEach((r) => {
    r.classList.remove('match');
    r.classList.remove('unmatch');
  });
  fields.forEach((i) => {
    const cat = i.id;
    results.forEach((r) => {
      if (i.value !== '' && r.getAttribute(`data-${cat}`)) {
        const values = r.getAttribute(`data-${cat}`).split(' ');
        if (values.includes(i.value)) {
          r.classList.add('match');
        } else {
          r.classList.add('unmatch');
        }
      }
    });
  });
}

async function fetchAndDisplayServices(target, endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const services = data.data?.governmentServiceList?.items || [];
    const ul = document.createElement('ul');

    services.forEach((service) => {
      const li = document.createElement('li');
      li.id = `serviceid-${service.serviceId}`;
      const agencyTag = service.agency[0].toString();
      if (agencyTag !== null) { li.dataset.agency = getAgency(agencyTag); }
      if (service.income) { li.dataset.income = loopProperty(service.income); }
      if (service.military) { li.dataset.military = loopProperty(service.military); }
      if (service.employment) { li.dataset.employment = loopProperty(service.employment); }
      if (service.keywords) { li.dataset.keywords = service.keywords; }
      const a = document.createElement('a');
      a.href = service.link || '#';
      if (service.relatedServices) { a.dataset.related = loopProperty(service.relatedServices); }
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (a.dataset.related) {
          const related = a.dataset.related.split(' ');
          if (localStorage.getItem('relatedServices')) {
            const saved = JSON.parse(localStorage.getItem('relatedServices'));
            related.forEach((r) => {
              if (!saved.includes(r)) {
                saved.push(r);
              }
            });
            localStorage.setItem('relatedServices', JSON.stringify(saved));
          } else {
            localStorage.setItem('relatedServices', JSON.stringify(related));
          }
        }
        const url = a.href;
        window.location.href = url;
      });
      const iconSpan = document.createElement('span');
      iconSpan.className = 'icon';
      const icon = getIcon(service.icon[0].toString());
      iconSpan.style.maskImage = `url(/icons/${icon})`;
      const titleSpan = document.createElement('span');
      titleSpan.className = 'title';
      titleSpan.textContent = service.title || 'No Title';

      const descriptionSpan = document.createElement('span');
      descriptionSpan.className = 'description';
      descriptionSpan.textContent = service.description.plaintext || 'No Description';

      a.append(iconSpan, titleSpan, descriptionSpan);
      li.appendChild(a);
      ul.appendChild(li);
    });

    target.appendChild(ul);

    const keyword = getKeyword();
    if (keyword) {
      filterKeyword(keyword);
    }

    const filterForm = document.querySelector('.search-filters form');
    const filters = filterForm.querySelectorAll('select');
    filters.forEach((filter) => {
      filter.addEventListener('change', filterResults);
    });
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

function handleSearch() {
  const field = document.querySelector('input.search-field');
  let keyword = field.value;
  keyword = encodeURIComponent(keyword);
  window.location.search = `q=${keyword}`;
  const searchResults = document.querySelector('.search-results');
  searchResults.textContent = '';
  fetchAndDisplayServices(searchResults, `https://publish-p49252-e308251.adobeaemcloud.com/graphql/execute.json/warp/allServices?${randomNumber}`);
  filterKeyword(keyword);
}

export default function decorate(block) {
  const searchFieldWrapper = document.createElement('div');
  searchFieldWrapper.className = 'search-wrapper';
  const searchFilters = document.createElement('div');
  searchFilters.className = 'search-filters';
  const form = document.createElement('form');

  const agencyLabel = document.createElement('label');
  agencyLabel.textContent = 'Agency or Department:';
  agencyLabel.setAttribute('for', 'agency');

  const agencySelect = document.createElement('select');
  agencySelect.setAttribute('id', 'agency');
  agencySelect.setAttribute('name', 'agency');

  const agencyOptions = [
    { label: 'Select to filter', value: '' },
    { label: 'Department of Agriculture', value: 'wsda' },
    { label: 'Department of Commerce', value: 'com' },
    { label: 'Department of Corrections', value: 'doc' },
    { label: 'Department of Ecology', value: 'ecy' },
    { label: 'Department of Health', value: 'doh' },
    { label: 'Department of Labor & Industries', value: 'li' },
    { label: 'Department of Licensing', value: 'dol' },
    { label: 'Department of Natural Resources', value: 'dnr' },
    { label: 'Department of Revenue', value: 'dor' },
    { label: 'Department of Social and Health Services', value: 'dshs' },
    { label: 'Department of Transportation', value: 'wsdot' },
    { label: 'Employment Security Department', value: 'esd' },
    { label: 'Washington State Patrol', value: 'wsp' },
    { label: 'Liquor and Cannabis Board', value: 'lcb' },
    { label: 'Utilities and Transportation Commission', value: 'utc' },
    { label: 'Gambling Commission', value: 'wsgc' },
    { label: 'Office of the Insurance Commissioner', value: 'oic' },
    { label: 'Human Rights Commission', value: 'hrc' },
    { label: 'Arts Commission', value: 'arts' },
    { label: 'Commission on African-American Affairs', value: 'caa' },
    { label: 'Commission on Hispanic Affairs', value: 'cha' },
    { label: 'Office of Minority and Women\'s Business Enterprises', value: 'omwbe' },
  ];

  agencyOptions.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    agencySelect.appendChild(option);
  });

  const employmentLabel = document.createElement('label');
  employmentLabel.textContent = 'Employment Status:';
  employmentLabel.setAttribute('for', 'employment');

  const employmentSelect = document.createElement('select');
  employmentSelect.setAttribute('id', 'employment');
  employmentSelect.setAttribute('name', 'employment');

  const employmentOptions = [
    { label: 'Select to filter', value: '' },
    { label: 'Employed Full-time (single employer)', value: 'ft-single' },
    { label: 'Employed Full-time (multiple employers)', value: 'ft-multiple' },
    { label: 'Employed Part-time', value: 'pt' },
    { label: 'Not Currently Employed', value: 'not-employed' },
  ];

  employmentOptions.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    employmentSelect.appendChild(option);
  });

  const incomeLabel = document.createElement('label');
  incomeLabel.textContent = 'Household Income:';
  incomeLabel.setAttribute('for', 'income');

  const incomeSelect = document.createElement('select');
  incomeSelect.setAttribute('id', 'income');
  incomeSelect.setAttribute('name', 'income');

  const incomeOptions = [
    { label: 'Select to filter', value: '' },
    { label: '0-$7,499', value: '0-7499' },
    { label: '$7,500-$14,999', value: '7500-14999' },
    { label: '$15,000-$24,999', value: '15000-24999' },
    { label: '$25,000-$34,999', value: '25000-34999' },
    { label: '$35,000-$54,999', value: '35000-54999' },
    { label: '$55,000-$74,999', value: '55000-74999' },
    { label: '$75,000-$99,999', value: '75000-99999' },
    { label: '$100,000-$149,999', value: '100000-149999' },
    { label: '$150,000-$199,999', value: '150000-199999' },
    { label: '$200,000-$249,999', value: '200000-249999' },
    { label: '$250,000-$299,999', value: '250000-299999' },
    { label: 'Above $300,000', value: 'above-300000' },
  ];

  incomeOptions.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    incomeSelect.appendChild(option);
  });

  const militaryLabel = document.createElement('label');
  militaryLabel.textContent = 'Military Status:';
  militaryLabel.setAttribute('for', 'military');

  const militarySelect = document.createElement('select');
  militarySelect.setAttribute('id', 'military');
  militarySelect.setAttribute('name', 'military');

  const militaryOptions = [
    { label: 'Select to filter', value: '' },
    { label: 'Active military', value: 'active' },
    { label: 'Military veteran', value: 'veteran' },
    { label: 'Family member of active service member', value: 'family-active' },
    { label: 'No military status', value: 'none' },
  ];

  militaryOptions.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    militarySelect.appendChild(option);
  });

  form.appendChild(agencyLabel);
  form.appendChild(agencySelect);
  form.appendChild(employmentLabel);
  form.appendChild(employmentSelect);
  form.appendChild(incomeLabel);
  form.appendChild(incomeSelect);
  form.appendChild(militaryLabel);
  form.appendChild(militarySelect);

  searchFilters.append(form);

  const searchResults = document.createElement('div');
  searchResults.className = 'search-results';
  const searchField = document.createElement('div');
  searchField.className = 'search-field';
  const field = document.createElement('input');
  field.type = 'text';
  field.className = 'search-field';
  field.placeholder = 'Find a service';
  const keyword = getKeyword();
  if (keyword) {
    field.value = keyword;
  }
  const button = document.createElement('button');
  button.className = 'search-button';
  button.innerText = 'GO';
  searchField.append(field, button);
  searchFieldWrapper.append(searchField, searchFilters, searchResults);
  block.append(searchFieldWrapper);

  button.addEventListener('click', handleSearch);
  fetchAndDisplayServices(searchResults, `https://publish-p49252-e308251.adobeaemcloud.com/graphql/execute.json/warp/allServices?${randomNumber}`);
}
