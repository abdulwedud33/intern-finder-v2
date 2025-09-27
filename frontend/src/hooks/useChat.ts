import { useState, useCallback } from "react";
import { Conversation, User, Message } from "@/types/chat";

// Mock data
const currentUser: User = {
  id: "current-user",
  name: "You",
  avatar: "/lovable-uploads/c78d3e22-784a-4171-9a14-f84bffde3804.png",
  isOnline: true,
};

const mockUsers: User[] = [
  {
    id: "jan-mayer",
    name: "Jan Mayer",
    role: "Recruiter",
    company: "Nomad",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: "joe-bartmann",
    name: "Joe Bartmann",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
  },
  {
    id: "ally-wales",
    name: "Ally Wales",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: "james-gardner",
    name: "James Gardner",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
  },
  {
    id: "allison-geidt",
    name: "Allison Geidt",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: "ruben-culhane",
    name: "Ruben Culhane",
    avatar:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
  },
];

const generateMockConversations = (): Conversation[] => {
  return mockUsers.map((user, index) => {
    const messages: Message[] = [];

    // Create some mock messages for Jan Mayer (first conversation)
    if (index === 0) {
      messages.push(
        {
          id: "msg-1",
          senderId: user.id,
          content:
            "Hey Jake, I wanted to reach out because we saw your work contributions and were impressed by your work.",
          timestamp: new Date(Date.now() - 3600000 + 720000), // 1 hour ago + 12 mins
        },
        {
          id: "msg-2",
          senderId: user.id,
          content: "We want to invite you for a quick interview",
          timestamp: new Date(Date.now() - 3600000 + 720000 + 60000), // 1 hour ago + 13 mins
        },
        {
          id: "msg-3",
          senderId: currentUser.id,
          content:
            "Hi Jan, sure I would love to. Thanks for taking the time to see my work!",
          timestamp: new Date(Date.now() - 720000), // 12 mins ago
        }
      );
    } else {
      // Add a simple message for other conversations
      messages.push({
        id: `msg-${user.id}`,
        senderId: user.id,
        content: "Hey thanks for your interview...",
        timestamp: new Date(Date.now() - 3600000 * (index + 1)),
      });
    }

    return {
      id: `conv-${user.id}`,
      participants: [currentUser, user],
      messages,
      lastMessage: messages[messages.length - 1],
      unreadCount: index === 0 ? 0 : Math.floor(Math.random() * 3),
    };
  });
};

export const useChat = () => {
  const [conversations] = useState<Conversation[]>(generateMockConversations());
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(conversations[0] || null);
  const [searchQuery, setSearchQuery] = useState("");

  const sendMessage = useCallback(
    (content: string) => {
      if (!activeConversation) return;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        content,
        timestamp: new Date(),
      };

      // Update the active conversation with the new message
      const updatedConversation = {
        ...activeConversation,
        messages: [...activeConversation.messages, newMessage],
        lastMessage: newMessage,
      };

      setActiveConversation(updatedConversation);

      // Update conversations array (in a real app, this would be handled by a state management solution)
      // For now, we'll just update the active conversation
    },
    [activeConversation]
  );

  return {
    conversations,
    activeConversation,
    currentUser,
    setActiveConversation,
    sendMessage,
    searchQuery,
    setSearchQuery,
  };
};
