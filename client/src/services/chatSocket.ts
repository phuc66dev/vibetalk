import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./apiClient";
import { getAccessToken } from "./tokenStorage";

let socket: Socket | null = null;

function getSocketOrigin() {
  if (typeof window === "undefined") {
    return API_BASE_URL;
  }

  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function getChatSocket() {
  if (!socket) {
    socket = io(getSocketOrigin(), {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export async function ensureChatSocketConnected() {
  const client = getChatSocket();
  client.auth = { token: getAccessToken() };

  if (client.connected) {
    return client;
  }

  return new Promise<Socket>((resolve, reject) => {
    const handleConnect = () => {
      cleanup();
      resolve(client);
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      client.off("connect", handleConnect);
      client.off("connect_error", handleError);
    };

    client.on("connect", handleConnect);
    client.on("connect_error", handleError);
    client.connect();
  });
}

export async function emitWithAck<T>(
  event: string,
  payload?: Record<string, unknown>,
) {
  const client = await ensureChatSocketConnected();

  return new Promise<T>((resolve, reject) => {
    client.timeout(10000).emit(event, payload ?? {}, (error: unknown, response: {
      data?: T;
      error?: string;
      ok?: boolean;
    }) => {
      if (error) {
        reject(error);
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error || "Socket request failed."));
        return;
      }

      resolve(response.data as T);
    });
  });
}
