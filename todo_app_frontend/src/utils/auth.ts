import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const authUtils = {
  // Token management
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(TOKEN_KEY, accessToken, { expires: 1 }); // 1 day
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 }); // 7 days
  },

  getAccessToken: (): string | null => {
    return Cookies.get(TOKEN_KEY) || null;
  },

  getRefreshToken: (): string | null => {
    return Cookies.get(REFRESH_TOKEN_KEY) || null;
  },

  removeTokens: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // User data management
  setUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authUtils.getAccessToken();
  }
};