import axios from 'axios'

const clientApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})

// Intercepteur pour injecter le token
clientApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour gérer l'expiration du token (401)
clientApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si on reçoit une 401 et qu'on n'a pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return clientApi(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = sessionStorage.getItem('admin_refresh_token');

      if (!refreshToken) {
        sessionStorage.removeItem('admin_token');
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${clientApi.defaults.baseURL}/admin/auth/refresh/`, {
          refresh: refreshToken
        });
        
        sessionStorage.setItem('admin_token', data.access);
        window.dispatchEvent(new CustomEvent('token-updated', { detail: data.access }));
        
        clientApi.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        
        processQueue(null, data.access);
        return clientApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_refresh_token');
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export function extraireMessageErreur(err, messageDefaut = 'Une erreur est survenue.') {
  const data = err?.response?.data
  if (!data) return messageDefaut
  if (typeof data === 'string') return data
  if (data.detail) return String(data.detail)
  if (data.erreur) return String(data.erreur)
  if (data.non_field_errors?.[0]) return String(data.non_field_errors[0])

  const premierChamp = Object.keys(data).find((cle) => Array.isArray(data[cle]) && data[cle][0])
  if (premierChamp) return String(data[premierChamp][0])

  return messageDefaut
}

export default clientApi
