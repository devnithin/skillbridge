import { useEffect, useCallback, useState } from "react";
import { useAuth } from "./use-auth";
import { type Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useChat(receiverId: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch existing messages
    fetch(`/api/messages/${receiverId}`, {
      credentials: "include" // Ensure cookies are sent
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
        return res.json();
      })
      .then(setMessages)
      .catch((error) => {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      });

    // Setup WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" || data.type === "message_sent") {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === "error") {
        console.error("WebSocket error:", data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat. Please try refreshing the page.",
        variant: "destructive",
      });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, receiverId, toast]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected) {
        toast({
          title: "Error",
          description: "Not connected to chat. Please try again.",
          variant: "destructive",
        });
        return;
      }

      socket.send(
        JSON.stringify({
          type: "message",
          receiverId,
          content,
        })
      );
    },
    [socket, isConnected, receiverId, toast]
  );

  return {
    messages,
    sendMessage,
    isConnected,
  };
}