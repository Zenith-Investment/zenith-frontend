"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuthStore } from "@/stores/auth";

// Types for WebSocket messages
export interface WebSocketMessage {
  type: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown>;
  ticker?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: object) => void;
  subscribe: (type: string, callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Singleton connection manager
class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  setConnectionCallback(callback: (connected: boolean) => void) {
    this.onConnectionChange = callback;
  }

  async connect(token: string): Promise<void> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      return this.connectionPromise || Promise.resolve();
    }

    // Already connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Close existing connection if any
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        // Determine WebSocket URL
        const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const wsHost = new URL(apiUrl).host;
        const wsUrl = `${wsProtocol}//${wsHost}/api/v1/ws/notifications?token=${token}`;

        console.log("WebSocket connecting to:", wsUrl.replace(token, "***"));
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.onConnectionChange?.(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.notifySubscribers(message);
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        };

        this.ws.onclose = (event) => {
          console.log("WebSocket disconnected", event.code, event.reason);
          this.isConnecting = false;
          this.onConnectionChange?.(false);

          // Only reconnect if it wasn't a clean close and we haven't exceeded attempts
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(token);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect(token: string) {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    // Exponential backoff: 2s, 4s, 8s, 16s, 32s
    const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts - 1), 32000);
    console.log(`WebSocket reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, "User disconnected");
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.onConnectionChange?.(false);
  }

  sendMessage(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(type: string, callback: (message: WebSocketMessage) => void): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(type)?.delete(callback);
    };
  }

  private notifySubscribers(message: WebSocketMessage) {
    // Notify subscribers for specific type
    this.subscribers.get(message.type)?.forEach((callback) => callback(message));
    // Notify subscribers for all messages
    this.subscribers.get("*")?.forEach((callback) => callback(message));
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const managerRef = useRef<WebSocketManager | null>(null);
  const hasConnectedRef = useRef(false);

  // Initialize manager
  useEffect(() => {
    managerRef.current = WebSocketManager.getInstance();
    managerRef.current.setConnectionCallback(setIsConnected);

    return () => {
      // Don't disconnect on unmount - singleton should persist
    };
  }, []);

  // Connect when authenticated
  useEffect(() => {
    if (!accessToken || !isAuthenticated || !managerRef.current) {
      return;
    }

    // Prevent multiple connection attempts
    if (hasConnectedRef.current && managerRef.current.isOpen()) {
      return;
    }

    hasConnectedRef.current = true;
    managerRef.current.connect(accessToken).catch((error) => {
      console.error("Failed to connect WebSocket:", error);
      hasConnectedRef.current = false;
    });

    return () => {
      // Don't disconnect on effect cleanup - only on logout
    };
  }, [accessToken, isAuthenticated]);

  // Disconnect on logout
  useEffect(() => {
    if (!isAuthenticated && managerRef.current) {
      managerRef.current.disconnect();
      hasConnectedRef.current = false;
    }
  }, [isAuthenticated]);

  const sendMessage = useCallback((message: object) => {
    managerRef.current?.sendMessage(message);
  }, []);

  const subscribe = useCallback((type: string, callback: (message: WebSocketMessage) => void) => {
    return managerRef.current?.subscribe(type, callback) || (() => {});
  }, []);

  // Keep connection alive with ping
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      managerRef.current?.sendMessage({ type: "ping" });
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected]);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
