import { useAuthStore } from '~/store/authStore';
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const isJWTExpired = (token: string | null): boolean => {
  try {
    if (!token) {
      throw new Error('Token is null or undefined');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    if (!payload.exp) {
      throw new Error('No expiration time found in token');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expired = payload.exp < currentTime;
    if (expired) {
      useAuthStore.getState().token = null;
      useAuthStore.getState().role = null;
      useAuthStore.getState().user = null;
    }
    return expired;
  } catch (error) {
    console.error('Error checking JWT expiration:', error);
    return true;
  }
};

export { formatDate, formatDateTime, formatTime, isJWTExpired };
