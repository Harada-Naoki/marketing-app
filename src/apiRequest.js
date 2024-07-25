import axios from 'axios';

const refreshAccessToken = async (refreshToken) => {
  try {
    console.log('Refreshing access token with refresh token:', refreshToken);
    const response = await axios.post('http://localhost:5000/api/auth/token', { token: refreshToken });
    console.log('New access token:', response.data.accessToken);
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

  if (!token) {
    console.log('No access token found, redirecting to login');
    window.location.href = '/marketing-app/login';
    return;
  }

  try {
    const response = await axios({
      url,
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('API request error:', error);
    if (error.response && error.response.status === 403) {
      console.log('Access token expired, attempting to refresh...');
      token = await refreshAccessToken(refreshToken);
      if (token) {
        console.log('Retrying original request with new access token...');
        const response = await axios({
          url,
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
        return response;
      } else {
        console.log('Refresh token invalid, redirecting to login...');
        window.location.href = '/marketing-app/login';
      }
    } else {
      throw error;
    }
  }
};

export default apiRequest;


