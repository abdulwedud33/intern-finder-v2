"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, MoreHorizontal, Star, Pin, Paperclip } from "lucide-react"
import { useState } from "react"

// Mock data - replace with real data from backend
const contacts = [
  {
    id: 1,
    name: "Jan Mayer",
    role: "Recruiter at Nomad",
    avatar: "/professional-headshot-musician.png",
    lastMessage: "We want to invite you for a qui...",
    timestamp: "10 mins ago",
    isActive: true,
    unread: true,
  },
  {
    id: 2,
    name: "Joe Bartmann",
    role: "HR Manager at Drivy",
    avatar: "/professional-headshot-joe-bartmann.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 3,
    name: "Ally Wales",
    role: "Talent Acquisition",
    avatar: "/professional-headshot-ally-wales.png",
    lastMessage: "Thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 4,
    name: "James Gardner",
    role: "Senior Recruiter",
    avatar: "/placeholder-6j59b.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 5,
    name: "Allison Geidt",
    role: "HR Specialist",
    avatar: "/placeholder-kpkc0.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 6,
    name: "Ruben Gulhane",
    role: "Talent Manager",
    avatar: "/professional-headshot-ruben-gulhane.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 7,
    name: "Lydia Diaz",
    role: "Recruitment Lead",
    avatar: "/professional-headshot-lydia-diaz.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 8,
    name: "James Schade",
    role: "HR Director",
    avatar: "/professional-headshot-james-schade.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
  {
    id: 9,
    name: "Angelina Swann",
    role: "Senior HR Manager",
    avatar: "/professional-headshot-angelina-swann.png",
    lastMessage: "Hey thanks for your interview...",
    timestamp: "2:40 PM",
    isActive: false,
    unread: false,
  },
]

const messages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Jan Mayer",
    senderAvatar: "/professional-headshot-musician.png",
    content: "Hey Jake, I wanted to reach out because we saw your work contributions and we're impressed by your work.",
    timestamp: "10 mins ago",
    isOwn: false,
  },
  {
    id: 2,
    senderId: 1,
    senderName: "Jan Mayer",
    senderAvatar: "/professional-headshot-musician.png",
    content: "We want to invite you for a quick interview tomorrow, if you're up for it!",
    timestamp: "10 mins ago",
    isOwn: false,
  },
  {
    id: 3,
    senderId: 0,
    senderName: "You",
    senderAvatar: "/professional-headshot-avatar.png",
    content: "Hi Jan, sure I would love to. Thanks for reaching out to me. I'm really excited!",
    timestamp: "10 mins ago",
    isOwn: true,
  },
]

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState(contacts[0])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // TODO: Implement backend integration to send message
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg overflow-hidden">
      {/* Messages List */}
      <div className="w-80 border-r bg-white flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
        <hr />
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages"
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedContact.id === contact.id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                    <AvatarFallback className="bg-blue-500 text-white font-medium">
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {contact.unread && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 flex-shrink-0">{contact.timestamp}</p>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 truncate">{contact.role}</p>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
              <AvatarFallback className="bg-blue-500 text-white font-medium">
                {selectedContact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
              <p className="text-sm text-gray-500">{selectedContact.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Today</span>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${message.isOwn ? "justify-end" : ""}`}>
                {!message.isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col ${message.isOwn ? "items-end" : "items-start"} max-w-md`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.isOwn ? "bg-blue-500 text-white" : "bg-white text-gray-900 shadow-sm border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">{message.timestamp}</p>
                </div>

                {message.isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt="You" />
                    <AvatarFallback className="bg-gray-400 text-white text-xs font-medium">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-gray-700 flex-shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Reply message"
                className="pr-12 py-3 rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
