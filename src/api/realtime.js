import { io } from "socket.io-client";
import { tokenStorage } from "./tokenStorage";

const defaultSocketUrl = () =>
  `${window.location.protocol}//${window.location.hostname}:4000`;
const socketUrl = (import.meta.env.VITE_API_BASE_URL || defaultSocketUrl())
  .replace(/\/+$/, "");

let socket = null;
const listeners = new Set();
const joinedOrderIds = new Set();
const seenEventIds = new Set();

const publish = (event) => {
  if (event?.id && seenEventIds.has(event.id)) return;
  if (event?.id) {
    seenEventIds.add(event.id);
    if (seenEventIds.size > 500) seenEventIds.delete(seenEventIds.values().next().value);
  }
  listeners.forEach((listener) => listener(event));
};

const createSocket = () => {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;
  const nextSocket = io(socketUrl, {
    auth: { token: `Bearer ${token}` },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 10000,
  });
  nextSocket.on("connect", () => {
    console.info(`Realtime connected (${nextSocket.id}) via ${nextSocket.io.engine.transport.name}`);
    joinedOrderIds.forEach((orderId) => nextSocket.emit("join:order", orderId));
    window.dispatchEvent(new CustomEvent("realtime:connected"));
  });
  nextSocket.on("connect_error", (error) => {
    console.error("Realtime connection failed:", error?.message || error);
    window.dispatchEvent(
      new CustomEvent("realtime:connection-error", {
        detail: { message: error?.message || "Realtime connection failed" },
      }),
    );
  });
  nextSocket.on("realtime:update", publish);
  return nextSocket;
};

export const connectRealtime = () => {
  if (!socket) socket = createSocket();
  if (socket && !socket.connected) socket.connect();
  return socket;
};

export const reconnectRealtime = () => {
  socket?.disconnect();
  socket = createSocket();
  socket?.connect();
};

export const disconnectRealtime = () => {
  socket?.disconnect();
  socket = null;
};

export const subscribeRealtime = (listener) => {
  listeners.add(listener);
  connectRealtime();
  return () => listeners.delete(listener);
};

export const joinOrderRoom = (orderId) => {
  const normalizedId = String(orderId || "").trim();
  if (!normalizedId) return () => {};
  joinedOrderIds.add(normalizedId);
  const activeSocket = connectRealtime();
  if (activeSocket?.connected) activeSocket.emit("join:order", normalizedId);
  return () => joinedOrderIds.delete(normalizedId);
};
