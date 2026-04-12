const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clearBtn');
const resultsEl = document.getElementById('results');
const summaryEl = document.getElementById('summary');
const matchCountEl = document.getElementById('matchCount');
let data = [];

function normalizeText(value) {
 return value && value !== 'NaN' ? String(value).trim() : '';
}

function extractPhoneNumbers(entry) {
 const phoneSet = new Set();
 const basePhone = normalizeText(entry.phone);
 if (basePhone) phoneSet.add(basePhone);

 const commentText = normalizeText(entry.comments);
 const foundPhones = commentText.match(/(?:\+?1[\s.-]*)?(?:\(?\d{3}\)?[\s.-]*)\d{3}[\s.-]*\d{4}/g) || [];
 foundPhones.forEach(phone => phoneSet.add(phone.trim()));

 return [...phoneSet];
}

function copyText(text, button) {
 navigator.clipboard.writeText(text).then(() => {
  if (!button) return;
  const original = button.textContent;
  button.textContent = 'Copied';
  setTimeout(() => {
   button.textContent = original;
  }, 1200);
 });
}

function copyAll(entry, button) {
 const phones = extractPhoneNumbers(entry).join(', ');
 const txt = `Prefix: ${entry.prefix}
Plan: ${normalizeText(entry.plan_type) || 'Not listed'}
Group Name: ${normalizeText(entry.account) || 'Not listed'}
Home Plan: ${normalizeText(entry.home_plan) || 'Not listed'}
Home Plan State: ${normalizeText(entry.state) || 'Not listed'}
Phone Numbers: ${phones || 'Not listed'}`;
 copyText(txt, button);
}

function renderSummary(list, query) {
 if (!query) {
  summaryEl.innerHTML = '';
  return;
 }

 const exactMatch = list.find(item => item.prefix === query);
 const states = new Set(list.map(item => normalizeText(item.state)).filter(Boolean));

 summaryEl.innerHTML = `
  <div class='summary-card'>
   <strong>${list.length}</strong>
   <span>${list.length === 1 ? 'match found' : 'matches found'}</span>
  </div>
  <div class='summary-card'>
   <strong>${exactMatch ? 'Yes' : 'No'}</strong>
   <span>Exact prefix match</span>
  </div>
  <div class='summary-card'>
   <strong>${states.size || 0}</strong>
   <span>Home plan ${states.size === 1 ? 'state' : 'states'}</span>
  </div>
 `;
}

function render(list, query) {
 renderSummary(list, query);

 if (!query) {
  resultsEl.innerHTML = `
   <div class='empty'>
    Enter a BCBS prefix to see plan details, group name, state, and phone numbers.
   </div>`;
  matchCountEl.textContent = 'Start typing to search the directory.';
  return;
 }

 if (!list.length) {
  resultsEl.innerHTML = `
   <div class='empty'>
    No results found for <strong>${query}</strong>. Try a shorter prefix or check the spelling.
   </div>`;
  matchCountEl.textContent = `No matches for ${query}`;
  return;
 }

 matchCountEl.textContent = `${list.length} ${list.length === 1 ? 'match' : 'matches'} for ${query}`;
 resultsEl.innerHTML = list.map(entry => {
  const sourceIndex = data.indexOf(entry);
  const state = normalizeText(entry.state) || 'Not listed';
  const groupName = normalizeText(entry.account) || 'Not listed';
  const homePlan = normalizeText(entry.home_plan) || 'Not listed';
  const planType = normalizeText(entry.plan_type) || 'Not listed';
  const phones = extractPhoneNumbers(entry);
  const flagBadges = (entry.flags || []).map(flag => `<span>${flag}</span>`).join('');
  const stateBadge = state !== 'Not listed' ? `<span>${state}</span>` : '';
  const comments = normalizeText(entry.comments);
  const phoneMarkup = phones.length
   ? phones.map((phone, phoneIndex) => `
    <div class='value'>
     ${phone}
     <button class='btn btn-secondary' type='button' onclick="copyPhone(${sourceIndex}, ${phoneIndex}, this)">Copy</button>
    </div>`).join('')
   : `<div class='value'>Not listed</div>`;

  return `
   <article class='card'>
    <div class='card-head'>
     <div class='prefix-chip'>
      <span>BCBS Prefix</span>
      <b>${entry.prefix}</b>
     </div>
     <div class='badges'>${flagBadges}${stateBadge}</div>
    </div>
    <div class='grid'>
     <div class='field'>
      <span class='label'>Plan</span>
      <div class='value'>${planType}</div>
     </div>
     <div class='field'>
      <span class='label'>Group Name</span>
      <div class='value'>${groupName}</div>
     </div>
     <div class='field'>
      <span class='label'>Home Plan</span>
      <div class='value'>${homePlan}</div>
     </div>
     <div class='field'>
      <span class='label'>Home Plan State</span>
      <div class='value'>${state}</div>
     </div>
     <div class='field'>
      <span class='label'>Phone Numbers</span>
      ${phoneMarkup}
     </div>
     <div class='field'>
      <span class='label'>Notes</span>
      <div class='value'>${comments || 'No additional notes'}</div>
     </div>
    </div>
    <div class='actions'>
     <button class='btn btn-primary' type='button' onclick='copyAll(data[${sourceIndex}], this)'>Copy all details</button>
    </div>
   </article>`;
 }).join('');
}

function getMatches(query) {
 return data
  .filter(entry => entry.prefix.startsWith(query))
  .sort((a, b) => {
   if (a.prefix === query && b.prefix !== query) return -1;
   if (b.prefix === query && a.prefix !== query) return 1;
   return a.prefix.localeCompare(b.prefix);
  });
}

function copyPhone(entryIndex, phoneIndex, button) {
 const phones = extractPhoneNumbers(data[entryIndex]);
 if (!phones[phoneIndex]) return;
 copyText(phones[phoneIndex], button);
}

function setLoadingState() {
 summaryEl.innerHTML = '';
 resultsEl.innerHTML = `
  <div class='empty'>
   Loading BCBS prefix data...
  </div>`;
 matchCountEl.textContent = 'Loading directory...';
}

function setErrorState() {
 summaryEl.innerHTML = '';
 resultsEl.innerHTML = `
  <div class='empty'>
   Unable to load the BCBS prefix data file. Make sure <strong>data.json</strong> is in the same folder as this app.
  </div>`;
 matchCountEl.textContent = 'Data file could not be loaded.';
}

searchInput.addEventListener('input', event => {
 const query = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
 event.target.value = query;
 render(getMatches(query), query);
});

clearBtn.addEventListener('click', () => {
 searchInput.value = '';
 render([], '');
 searchInput.focus();
});

async function loadData() {
 setLoadingState();

 try {
  const response = await fetch('data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  data = await response.json();
  render([], '');
 } catch (error) {
  console.error('Failed to load data.json', error);
  setErrorState();
 }
}

loadData();


