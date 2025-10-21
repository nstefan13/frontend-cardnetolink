import { constants } from '@/configs';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: constants.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
