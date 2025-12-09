import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper para adicionar timeout
const fetchWithTimeout = (url: string, options: RequestInit, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Servidor não respondeu')), timeout)
    ),
  ]);
};

export const apiClient = {
  get: async (endpoint: string) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('GET Request:', url);
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log('GET Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro na requisição');
    }
    
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('POST Request:', url);
    console.log('POST Data:', data);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    console.log('POST Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro na requisição');
    }

    return response.json();
  },
};
