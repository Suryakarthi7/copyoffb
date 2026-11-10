// 0. Theme Switcher Logic
const themeDots = document.querySelectorAll('.theme-dot');
const savedTheme = localStorage.getItem('app_theme') || 'ocean';

function applyTheme(theme) {
  if (theme === 'ocean') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  themeDots.forEach(dot => {
    dot.classList.toggle('active', dot.dataset.setTheme === theme);
  });
  localStorage.setItem('app_theme', theme);
}

// Apply initial saved theme
applyTheme(savedTheme);

themeDots.forEach(dot => {
  dot.addEventListener('click', () => {
    applyTheme(dot.dataset.setTheme);
  });
});

// Determine API Base URL (works via Nginx container, backend server, or direct file)
const API_BASE_URL = window.location.protocol.startsWith('http') && !['5500', '3000'].includes(window.location.port)
  ? '/api/v1' 
  : 'http://localhost:5000/api/v1';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const submitBtn = document.getElementById('submitBtn');
const btnLoader = document.getElementById('btnLoader');
const alertBox = document.getElementById('alertBox');
const alertIcon = document.getElementById('alertIcon');
const alertMessage = document.getElementById('alertMessage');

// Records table elements
const toggleTableBtn = document.getElementById('toggleTableBtn');
const recordsPanel = document.getElementById('recordsPanel');
const closePanelBtn = document.getElementById('closePanelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tableBody = document.getElementById('tableBody');
const dbStatus = document.getElementById('dbStatus');

// 1. Password Visibility Toggle
togglePasswordBtn.addEventListener('click', () => {
  const isPassword = passwordInput.getAttribute('type') === 'password';
  passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
  eyeIcon.classList.toggle('fa-eye', !isPassword);
  eyeIcon.classList.toggle('fa-eye-slash', isPassword);
});

// 2. Alert Notification Helper
function showAlert(message, type = 'success') {
  alertBox.className = `alert ${type}`;
  alertMessage.textContent = message;
  alertIcon.className = type === 'success' 
    ? 'fa-solid fa-circle-check' 
    : 'fa-solid fa-triangle-exclamation';
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 6000);
}

// 3. Form Submit Handler (Save to PostgreSQL)
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email_or_username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!email_or_username || !password) {
    showAlert('Please fill in all fields.', 'error');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  btnLoader.classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_or_username,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAlert(`Success: Login details stored in PostgreSQL! (ID: ${data.data.id})`, 'success');
      loginForm.reset();
      
      // Auto-refresh records list if open
      if (!recordsPanel.classList.contains('hidden')) {
        loadRecords();
      }
    } else {
      showAlert(data.message || 'Error occurred while saving to database.', 'error');
    }
  } catch (err) {
    showAlert('Failed to connect to backend server. Make sure backend is running on port 5000.', 'error');
    console.error('Fetch error:', err);
  } finally {
    submitBtn.disabled = false;
    btnLoader.classList.add('hidden');
  }
});

// 4. Stored Records View & Refresh
async function loadRecords() {
  dbStatus.textContent = 'Fetching...';
  try {
    const response = await fetch(`${API_BASE_URL}/logins`);
    const data = await response.json();

    if (data.success && data.records.length > 0) {
      dbStatus.textContent = `Total: ${data.records.length} records`;
      tableBody.innerHTML = data.records.map(rec => `
        <tr>
          <td><strong>#${rec.id}</strong></td>
          <td>${escapeHtml(rec.email_or_username)}</td>
          <td>${new Date(rec.login_time).toLocaleString()}</td>
          <td><code>${escapeHtml(rec.ip_address || '127.0.0.1')}</code></td>
        </tr>
      `).join('');
    } else {
      dbStatus.textContent = 'No records found';
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No login details found in database.</td></tr>`;
    }
  } catch (err) {
    dbStatus.textContent = 'Server Offline';
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:#ef4444;">Cannot reach server. Start backend server first.</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 5. Panel Toggle Buttons
toggleTableBtn.addEventListener('click', () => {
  recordsPanel.classList.toggle('hidden');
  if (!recordsPanel.classList.contains('hidden')) {
    loadRecords();
  }
});

closePanelBtn.addEventListener('click', () => {
  recordsPanel.classList.add('hidden');
});

refreshBtn.addEventListener('click', loadRecords);
