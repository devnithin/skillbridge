import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Chat from "@/components/chat";
import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: conversations = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/conversations"],
    retry: 3, // Retry failed requests 3 times
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#283E4A] mb-8">Messages</h1>
          <Card className="p-6 text-center text-destructive">
            <p>Failed to load conversations. Please try again later.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-3">Messages</h1>
        <p className="text-muted-foreground mb-8">Chat with your connections</p>

        <div className="grid grid-cols-[320px_1fr] gap-8">
          <Card className="p-4 shadow-lg border-primary/10">
            <h2 className="font-semibold text-lg mb-6 px-2">Conversations</h2>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p className="text-center">
                  No conversations yet. Start chatting with someone from the search page!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {conversations.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => setSelectedUser(contact)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent/80 ${
                        selectedUser?.id === contact.id ? "bg-accent shadow-sm" : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contact.avatar || undefined} />
                        <AvatarFallback>{contact.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium">{contact.username}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>

          <Card className="p-4">
            {selectedUser ? (
              <Chat
                receiverId={selectedUser.id}
                receiverName={selectedUser.fullName}
              />
            ) : (
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                {conversations.length > 0
                  ? "Select a conversation to start chatting"
                  : "Your messages will appear here"}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}