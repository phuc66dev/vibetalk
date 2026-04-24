import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor for error handling to match existing ApiError logic
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    
    let message = 'Request failed';
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    throw new ApiError(message, status, data);
  }
);

export const apiClient = {
  get: <T>(path: string, options?: any) => 
    axiosInstance.get<T, T>(path, options),
  post: <T>(path: string, body?: any, options?: any) => 
    axiosInstance.post<T, T>(path, body, options),
  put: <T>(path: string, body?: any, options?: any) => 
    axiosInstance.put<T, T>(path, body, options),
  patch: <T>(path: string, body?: any, options?: any) => 
    axiosInstance.patch<T, T>(path, body, options),
  delete: <T>(path: string, options?: any) => 
    axiosInstance.delete<T, T>(path, options),
};
