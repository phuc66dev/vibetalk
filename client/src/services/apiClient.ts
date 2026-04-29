import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

export const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_SERVER_ORIGIN
    : import.meta.env.VITE_SERVER_ORIGIN_RENDER;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function unwrapResponseData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

function setAuthorizationHeader(
  headers: InternalAxiosRequestConfig["headers"],
  token: string,
) {
  const nextHeaders = AxiosHeaders.from(headers ?? {});
  nextHeaders.set("Authorization", `Bearer ${token}`);
  return nextHeaders;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
        "/auth/refresh-token",
        null,
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      )
      .then((response) => {
        const tokens = unwrapResponseData<{ accessToken: string; refreshToken: string }>(
          response.data,
        );
        setTokens(tokens);
        return tokens.accessToken;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers = setAuthorizationHeader(config.headers, accessToken);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => unwrapResponseData(response.data),
  async (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const requestConfig = error.config as RetryableRequestConfig | undefined;

    if (
      status === 401 &&
      requestConfig &&
      !requestConfig._retry &&
      !requestConfig.url?.includes("/auth/refresh-token")
    ) {
      requestConfig._retry = true;

      const nextAccessToken = await refreshAccessToken();
      if (nextAccessToken) {
        requestConfig.headers = setAuthorizationHeader(
          requestConfig.headers,
          nextAccessToken,
        );
        return axiosInstance(requestConfig);
      }
    }

    let message = "Request failed";
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    throw new ApiError(message, status, data);
  },
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
