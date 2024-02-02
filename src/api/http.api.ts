import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@app/api/ApiError';
import { deleteToken, readToken } from '@app/services/localStorage.service';
import { notificationController } from '@app/controllers/notificationController';
import { BACKEND_BASE_URL } from '@app/constants/config/api';

export const httpApi = axios.create({
  baseURL: BACKEND_BASE_URL,
  // baseURL: 'https://nest-e-learning.onrender.com',
});

httpApi.interceptors.request.use((config) => {
  config.headers = { ...config.headers, Authorization: `Bearer ${readToken()}` };

  return config;
});

httpApi.interceptors.response.use(undefined, (error: any) => {
  if (error.toJSON().status === 401) {
    deleteToken();
    window.location.href = '/auth/login';
  }
  notificationController.error({
    message: Array.isArray(error.response?.data?.message)
      ? error.response?.data?.message?.[0]
      : error.response?.data.message,
  });
  return;
  // throw new ApiError<ApiErrorData>(error.response?.data.message || error.message, error.response?.data);
});

export interface ApiErrorData {
  message: string;
}
