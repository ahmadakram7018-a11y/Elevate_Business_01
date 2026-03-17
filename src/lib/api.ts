import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
             refresh_token: refreshToken 
          });
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/token', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/users/me'),
};

export const emailApi = {
  fetch: (mode: string) => api.get(`/emails/fetch?mode=${mode}`),
  getStats: () => api.get('/emails/stats'),
  getHistory: (category?: string, status?: string) => {
    let url = '/emails/history';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    return api.get(url);
  },
  updateHistory: (id: number, updates: any) => api.patch(`/emails/history/${id}`, updates),
  takeAction: (id: number, action: 'draft' | 'send', reply_body: string) => 
    api.post(`/emails/action/${id}`, { action, reply_body }),
  
  // Gmail OAuth
  getGmailAuthUrl: () => api.get('/auth/gmail/url'),
  exchangeGmailToken: (code: string) => api.post('/auth/gmail/exchange', { code }),
  getGmailAccounts: () => api.get('/auth/gmail/accounts'),
  selectGmailAccount: (accountId: number) => api.post(`/auth/gmail/select/${accountId}`),

  // Chatbot & Compose
  chatbotReply: (data: any) => api.post('/api/chatbot/reply', data),
  improveEmail: (body: string, instruction: string) => api.post('/api/email/improve', { body, instruction }),
  sendNewEmail: (data: any) => api.post('/api/email/send', data),
  saveNewDraft: (data: any) => api.post('/api/email/draft', data),
};

export default api;
