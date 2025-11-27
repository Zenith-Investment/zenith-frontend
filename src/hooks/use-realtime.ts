"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useWebSocket, WebSocketMessage } from "@/contexts/websocket-context";

// Types for real-time data
export interface MarketQuote {
  ticker: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  timestamp: string;
}

export interface PortfolioUpdate {
  total_value: number;
  daily_change: number;
  daily_change_percent: number;
  timestamp: string;
}

export interface AlertTriggered {
  alert_id: number;
  ticker: string;
  condition: string;
  target_price: number;
  current_price: number;
  timestamp: string;
}

interface UseRealtimeOptions {
  onQuote?: (quote: MarketQuote) => void;
  onPortfolioUpdate?: (update: PortfolioUpdate) => void;
  onAlertTriggered?: (alert: AlertTriggered) => void;
  subscriptions?: string[]; // List of tickers to subscribe to
  autoConnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    onQuote,
    onPortfolioUpdate,
    onAlertTriggered,
  } = options;

  const { isConnected, subscribe, sendMessage } = useWebSocket();
  const [lastQuotes, setLastQuotes] = useState<Map<string, MarketQuote>>(new Map());
  const [portfolioValue, setPortfolioValue] = useState<PortfolioUpdate | null>(null);
  const subscribedTickersRef = useRef<Set<string>>(new Set());

  // Subscribe to realtime messages via shared WebSocket
  useEffect(() => {
    const unsubscribe = subscribe("*", (message: WebSocketMessage) => {
      switch (message.type) {
        case "quote":
          const quote = message.data as unknown as MarketQuote;
          if (quote?.ticker) {
            setLastQuotes((prev) => {
              const newMap = new Map(prev);
              newMap.set(quote.ticker, quote);
              return newMap;
            });
            onQuote?.(quote);
          }
          break;

        case "portfolio_update":
          const update = message.data as unknown as PortfolioUpdate;
          if (update) {
            setPortfolioValue(update);
            onPortfolioUpdate?.(update);
          }
          break;

        case "alert_triggered":
          const alert = message.data as unknown as AlertTriggered;
          if (alert) {
            onAlertTriggered?.(alert);
          }
          break;
      }
    });

    return unsubscribe;
  }, [subscribe, onQuote, onPortfolioUpdate, onAlertTriggered]);

  const subscribeTicker = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    if (!subscribedTickersRef.current.has(upperTicker)) {
      sendMessage({
        action: "subscribe",
        ticker: upperTicker,
      });
      subscribedTickersRef.current.add(upperTicker);
    }
  }, [sendMessage]);

  const unsubscribeTicker = useCallback((ticker: string) => {
    const upperTicker = ticker.toUpperCase();
    if (subscribedTickersRef.current.has(upperTicker)) {
      sendMessage({
        action: "unsubscribe",
        ticker: upperTicker,
      });
      subscribedTickersRef.current.delete(upperTicker);
    }
  }, [sendMessage]);

  const getQuote = useCallback(
    (ticker: string): MarketQuote | undefined => {
      return lastQuotes.get(ticker.toUpperCase());
    },
    [lastQuotes]
  );

  return {
    isConnected,
    lastQuotes,
    portfolioValue,
    connect: () => {}, // No-op, connection is managed by context
    disconnect: () => {}, // No-op, connection is managed by context
    subscribeTicker,
    unsubscribeTicker,
    getQuote,
  };
}

// Hook for subscribing to specific tickers
export function useTickerQuote(ticker: string) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);

  const { isConnected, subscribeTicker, unsubscribeTicker, getQuote } = useRealtime({
    onQuote: (q) => {
      if (q.ticker === ticker.toUpperCase()) {
        setQuote(q);
      }
    },
    autoConnect: true,
  });

  useEffect(() => {
    if (isConnected && ticker) {
      subscribeTicker(ticker);
      // Check if we already have a quote
      const existingQuote = getQuote(ticker);
      if (existingQuote) {
        setQuote(existingQuote);
      }
    }

    return () => {
      if (ticker) {
        unsubscribeTicker(ticker);
      }
    };
  }, [isConnected, ticker, subscribeTicker, unsubscribeTicker, getQuote]);

  return { quote, isConnected };
}
