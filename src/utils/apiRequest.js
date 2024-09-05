import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

const apiRequest = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

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

    if (error.response && error.response.status === 403) {
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
        console.error('Token refresh failed');
        navigate('/');  
      }
    } else {
      throw error;
    }
  }
};

export default apiRequest;