import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@app/api/ApiError';
import { readToken } from '@app/services/localStorage.service';
import { notificationController } from '@app/controllers/notificationController';

export const httpApi = axios.create({
  // baseURL: process.env.REACT_APP_BASE_URL,
  baseURL: 'https://nest-e-learning.onrender.com',
});

httpApi.interceptors.request.use((config) => {
  config.headers = { ...config.headers, Authorization: `Bearer ${readToken()}` };

  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
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
