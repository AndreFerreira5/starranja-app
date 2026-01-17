import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

// Refresh token every 14 minutes (assuming 15-minute access token expiry)
const REFRESH_INTERVAL = 14 * 60 * 1000;

export const useTokenRefresh = () => {
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            await AsyncStorage.setItem('access_token', data.access_token);
            scheduleTokenRefresh(); // Schedule next refresh
          }
        } catch (error) {
          console.error('Proactive refresh failed:', error);
        }
      }, REFRESH_INTERVAL);
    } catch (error) {
      console.error('Token refresh scheduling error:', error);
    }
  }, []);

  useEffect(() => {
    scheduleTokenRefresh();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [scheduleTokenRefresh]);
};
