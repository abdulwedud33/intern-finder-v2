export interface User {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  currentUser: User;
  setActiveConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
