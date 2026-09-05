// auth.js
// Handles authentication UI and API interactions

const Auth = {
  token: localStorage.getItem('retail_access_token'),
  refreshToken: localStorage.getItem('retail_refresh_token'),
  user: JSON.parse(localStorage.getItem('retail_user') || 'null'),

  init() {
    this.checkAuth();
    this.attachLogoutHandler();
  },

  checkAuth() {
    if (!this.token) {
      this.showLogin();
    } else {
      this.hideLogin();
      this.fetchUserProfile(); // Verify token is still valid
    }
  },

  async fetchUserProfile() {
    try {
      const res = await this.apiFetch('/auth/me');
      if (res.success) {
        this.user = res.data;
        localStorage.setItem('retail_user', JSON.stringify(res.data));
        this.updateProfileUI();
        window.renderApp(); // Rerender based on roles
      }
    } catch (e) {
      this.logout(false);
    }
  },

  showLogin() {
    document.getElementById('app').style.display = 'none';
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
      loginOverlay.style.display = 'flex';
    }
  },

  hideLogin() {
    document.getElementById('app').style.display = 'flex';
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
      loginOverlay.style.display = 'none';
    }
  },

  async login(email, password) {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        this.token = data.data.access_token;
        this.refreshToken = data.data.refresh_token;
        this.user = data.data.user;
        
        localStorage.setItem('retail_access_token', this.token);
        localStorage.setItem('retail_refresh_token', this.refreshToken);
        localStorage.setItem('retail_user', JSON.stringify(this.user));
        
        this.hideLogin();
        this.updateProfileUI();
        window.showToast("Login successful", "success");
        window.renderApp();
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (e) {
      window.showToast(e.message, "danger");
      return false;
    }
  },

  async logout(callApi = true) {
    if (callApi && this.token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      } catch (e) {}
    }
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('retail_access_token');
    localStorage.removeItem('retail_refresh_token');
    localStorage.removeItem('retail_user');
    this.showLogin();
  },

  async apiFetch(endpoint, options = {}) {
    if (!this.token) throw new Error("Not authenticated");
    
    const url = `/api/v1${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...(options.headers || {})
    };

    let res = await fetch(url, { ...options, headers });
    
    // Auto-refresh token on 401
    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this.doRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        res = await fetch(url, { ...options, headers });
      } else {
        this.logout(false);
        throw new Error("Session expired");
      }
    }

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "API Error");
    return data;
  },

  async doRefreshToken() {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });
      const data = await res.json();
      if (data.success) {
        this.token = data.data.access_token;
        this.refreshToken = data.data.refresh_token;
        localStorage.setItem('retail_access_token', this.token);
        localStorage.setItem('retail_refresh_token', this.refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  updateProfileUI() {
    if (!this.user) return;
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (nameEl) nameEl.textContent = this.user.full_name;
    if (roleEl) roleEl.textContent = this.user.role.replace('_', ' ');
  },

  attachLogoutHandler() {
    const profileCard = document.querySelector('.user-profile');
    if (profileCard) {
      profileCard.style.cursor = 'pointer';
      profileCard.title = 'Click to Logout';
      profileCard.addEventListener('click', () => {
        if(confirm("Are you sure you want to log out?")) {
          this.logout();
        }
      });
    }
  }
};

window.Auth = Auth;

// Handle Login Form Submit
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pwd = document.getElementById('password').value;
      const btn = loginForm.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Authenticating...';
      
      await Auth.login(email, pwd);
      
      btn.disabled = false;
      btn.textContent = 'Sign In';
    });
  }
});
