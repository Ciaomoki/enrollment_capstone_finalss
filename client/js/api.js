// client/js/api.js
// Detect API base. Default to http://localhost (server listens on 5000).
// If your server runs on a different port, set window.API_BASE = 'http://localhost:3000';
const META_API = document.querySelector('meta[name="api-base"]');
const API_BASE = (window.API_BASE || (META_API ? META_API.content : 'http://localhost:5000'));
const API = API_BASE.replace(/\/$/, '') + '/api';

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

// Attach to the first <form> on the page, if present
function on(selector, event, handler) {
  const el = document.querySelector(selector);
  if (el) el.addEventListener(event, handler);
}

// Helper to show inline errors (or alert fallback)
function showSuccess(msg) {
  const out = document.querySelector('#errorMsgReg, #msg, .muted');
  if (out && out.tagName === 'P') {
    out.textContent = msg;
    out.style.color = 'green';
    out.classList.remove('hidden');
  } else {
    alert(msg);
  }
}
function showError(msg) {
  const out = document.querySelector('.error, #msg, .muted');
  if (out && out.tagName === 'P') {
    out.textContent = msg;
    out.style.color = 'crimson';
  } else {
    alert(msg);
  }
}

// Student Register page (studregister.php)
if (location.pathname.toLowerCase().includes('studregister.php')) {
  on('form', 'submit', async (e) => {
    e.preventDefault();
    const student_id = parseInt(document.getElementById('student_id')?.value || '', 10);
    const full_name = document.getElementById('full_name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const course = document.getElementById('course')?.value?.trim();
    const password = document.getElementById('password')?.value || '';

    try {
      await postJSON(`${API}/student/register`, { student_id, full_name, email, course, password });
      showSuccess('Registration successful! Redirecting to login...');
      setTimeout(()=> location.href='studlogin.php', 800);
    } catch (err) {
      showError(err.message);
    }
  });
}

// Student Login page (studlogin.php)
if (location.pathname.toLowerCase().includes('studlogin.php')) {
  on('form', 'submit', async (e) => {
    e.preventDefault();
    const student_id = parseInt(document.getElementById('studentId')?.value || '', 10);
    const password = document.getElementById('password')?.value || '';

    try {
      const data = await postJSON(`${API}/login/student`, { student_id, password });
      // Save token for later authorized calls
      localStorage.setItem('token', data.token);
      // go to student dashboard (existing page)
      location.href = 'studdashb.php';
    } catch (err) {
      showError(err.message);
    }
  });
}

// Evaluator Login (evallogin.php)
if (location.pathname.toLowerCase().includes('evallogin.php')) {
  on('form', 'submit', async (e) => {
    e.preventDefault();
    const employee_id = parseInt(document.getElementById('evalId')?.value || '', 10);
    const password = document.getElementById('evalPass')?.value || '';

    try {
      const data = await postJSON(`${API}/login/evaluator`, { employee_id, password });
      localStorage.setItem('token', data.token);
      location.href = '../Evaluator/evaldashb.php';
    } catch (err) {
      showError(err.message);
    }
  });
}

// Admin Login (adminlogin.php)
if (location.pathname.toLowerCase().includes('adminlogin.php')) {
  on('form', 'submit', async (e) => {
    e.preventDefault();
    const admin_id = parseInt(document.getElementById('admin_id')?.value || '', 10);
    const password = document.getElementById('password')?.value || '';

    try {
      const data = await postJSON(`${API}/login/admin`, { admin_id, password });
      localStorage.setItem('token', data.token);
      location.href = '../Admin/admindashb.php';
    } catch (err) {
      showError(err.message);
    }
  });
}

// Evaluator Register (evalregister.php)
if (location.pathname.toLowerCase().includes('evalregister.php')) {
  on('form', 'submit', async (e) => {
    e.preventDefault();
    const employee_id = parseInt(document.getElementById('evaluator_id')?.value || '', 10);
    const name = document.getElementById('evaluator_name')?.value?.trim();
    const email = document.getElementById('evaluator_email')?.value?.trim();
    const department = document.getElementById('department')?.value?.trim();
    const password = document.getElementById('evaluator_password')?.value || '';
    try {
      await postJSON(`${API}/evaluator/register`, { employee_id, name, email, department, password });
      showSuccess('Registration successful! Redirecting to login...');
      setTimeout(()=> location.href='evallogin.php', 800);
    } catch (err) {
      showError(err.message);
    }
  });
}
