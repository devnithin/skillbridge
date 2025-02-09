import { useEffect, useCallback, useState } from "react";
import { useAuth } from "./use-auth";
import { type Message } from "@shared/schema";

export function useChat(receiverId: number) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch existing messages
    fetch(`/api/messages/${receiverId}`)
      .then((res) => res.json())
      .then(setMessages);

    // Setup WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" || data.type === "message_sent") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, receiverId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected) return;

      socket.send(
        JSON.stringify({
          type: "message",
          receiverId,
          content,
        })
      );
    },
    [socket, isConnected, receiverId]
  );

  return {
    messages,
    sendMessage,
    isConnected,
  };
}
