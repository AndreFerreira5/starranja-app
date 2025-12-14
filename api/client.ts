import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = 10000
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Servidor não respondeu')), timeout)
    ),
  ]);
};

const logout = async () => {
  await AsyncStorage.removeItem('access_token');
  router.replace('/sign-in');
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    await AsyncStorage.setItem('access_token', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};

const makeRequest = async (
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<any> => {
  const token = await AsyncStorage.getItem('access_token');
  
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetchWithTimeout(url, requestOptions);

  if (response.status === 401 && retryCount === 0) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => makeRequest(url, options, retryCount + 1))
        .catch(err => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      
      if (!newToken) {
        await logout();
        processQueue(new Error('Session expired'));
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      processQueue(null);
      isRefreshing = false;
      
      return makeRequest(url, options, retryCount + 1);
    } catch (error) {
      processQueue(error as Error);
      isRefreshing = false;
      await logout();
      throw error;
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro na requisição');
  }

  return response.json();
};

export const apiClient = {
  get: async (endpoint: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('GET Request:', url);
    return makeRequest(url, { method: 'GET' });
  },

  post: async (endpoint: string, data: any) => {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('POST Request:', url);
    return makeRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch: async (endpoint: string, data: any) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return makeRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (endpoint: string) => {
    const url = `${API_BASE_URL}${endpoint}`;
    return makeRequest(url, { method: 'DELETE' });
  },
};

export { logout };
