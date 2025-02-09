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
      credentials: "include"
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

    // Setup WebSocket connection with reconnection logic
    function connectWebSocket() {
      if (!user) return;
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        ws.send(JSON.stringify({ type: "auth", userId: user.id }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket message:", data);
          if (data.type === "message" || data.type === "message_sent") {
            const newMessage = data.message;
            // Only add messages for this conversation
            if (
              (newMessage.senderId === user.id && newMessage.receiverId === receiverId) ||
              (newMessage.senderId === receiverId && newMessage.receiverId === user.id)
            ) {
              setMessages((prev) => [...prev, newMessage]);
            }
          } else if (data.type === "error") {
            console.error("WebSocket error:", data.message);
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, attempting to reconnect...");
        setIsConnected(false);
        // Attempt to reconnect after 2 seconds
        setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat. Attempting to reconnect...",
          variant: "destructive",
        });
      };

      setSocket(ws);

      return ws;
    }

    let ws = connectWebSocket();

    // Clean up on unmount or user change
    return () => {
      if (ws) {
        ws.close();
        setIsConnected(false);
      }
    };

  }, [user?.id, receiverId, toast]);

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