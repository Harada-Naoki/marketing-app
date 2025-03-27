import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    return true; // 無効なトークンは期限切れとみなす
  }
};

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/token`, { token: refreshToken });
    localStorage.setItem('token', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error('Error refreshing access token', error);
    return null;
  }
};

const apiRequest = async (url, options = {}, navigate) => {
  let token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  // ✅ リクエスト前にトークンの有効期限を確認
  if (token && isTokenExpired(token)) {
    console.log('[apiRequest] Access token expired, attempting refresh...');
    token = await refreshAccessToken(refreshToken);
    if (!token) {
      console.error('[apiRequest] Refresh failed before request, redirecting...');
      if (navigate) navigate('/');
      throw new Error('Unauthorized');
    }
  }

  try {
    const response = await axios({
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    });
    return response;
  } catch (error) {
    console.error('Initial request error:', error.response?.data || error.message);

    // ✅ 401 or 403 エラーならトークンリフレッシュして再試行
    if ((error.response?.status === 401 || error.response?.status === 403) && refreshToken) {
      token = await refreshAccessToken(refreshToken);
      if (token) {
        try {
          const response = await axios({
            url: `${API_BASE_URL}${url}`,
            method: options.method || 'GET',
            data: options.data || {},
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`
            }
          });
          return response;
        } catch (retryError) {
          console.error('Retry request error:', retryError.response?.data || retryError.message);
          throw retryError;
        }
      } else {
        console.error('[apiRequest] Refresh failed after error, redirecting...');
        if (navigate) navigate('/');
        throw new Error('Unauthorized');
      }
    } else {
      throw error;
    }
  }
};

export default apiRequest;
