const loginForm = document.querySelector('#loginForm');
const loginCard = document.querySelector('#loginCard');
const dashboard = document.querySelector('#dashboard');
const loginError = document.querySelector('#loginError');
const submissionTableBody = document.querySelector('#submissionTableBody');

const ADMIN_EMAIL = 'info@africatrialus.com';

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    if (user.email !== ADMIN_EMAIL) {
      firebase.auth().signOut();
      loginError.textContent = 'This account is not authorized to view this admin panel.';
      loginError.classList.remove('hidden');
      return;
    }

    loginCard.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadSubmissions();
  } else {
    loginCard.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#adminEmail').value.trim();
  const password = document.querySelector('#adminPassword').value;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    loginError.textContent = error.message;
    loginError.classList.remove('hidden');
  }
});

function renderSubmissions(submissions) {
  submissionTableBody.innerHTML = '';

  if (!submissions.length) {
    submissionTableBody.innerHTML = '<tr><td colspan="7" class="muted">No submissions yet.</td></tr>';
    return;
  }

  submissions.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.country || ''}</td>
      <td>${entry.diseaseArea || ''}</td>
      <td>${entry.email || ''}</td>
      <td>${entry.address || ''}</td>
      <td>${entry.code || ''}</td>
      <td>${entry.telephone || ''}</td>
      <td>${entry.createdAt ? new Date(entry.createdAt.seconds * 1000).toLocaleString() : '—'}</td>
    `;
    submissionTableBody.appendChild(row);
  });
}

function loadSubmissions() {
  firebase.firestore()
    .collection('participantContacts')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderSubmissions(entries);
    });
}
