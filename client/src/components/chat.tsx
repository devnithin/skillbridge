import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Chat({ receiverId, receiverName }: { receiverId: number; receiverName: string }) {
  const { messages, sendMessage, isConnected } = useChat(receiverId);
  const { user } = useAuth();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span>Chat with {receiverName}</span>
          {!isConnected && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message) => {
            const isSender = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-5 py-3 shadow-sm ${
                    isSender
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(message.createdAt), "p")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-card flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!isConnected || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
