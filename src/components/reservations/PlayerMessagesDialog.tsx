
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface PlayerMessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  gameName: string;
  currentUserId: string;
  currentUserName: string;
}

/**
 * Messages dialog for players to communicate about a specific game
 * Allows real-time messaging between players in the same reservation
 */
const PlayerMessagesDialog: React.FC<PlayerMessagesDialogProps> = ({
  isOpen,
  onClose,
  reservationId,
  gameName,
  currentUserId,
  currentUserName
}) => {
  const [messages, setMessages] = useState<Message[]>([
    // Mock messages for demonstration
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      message: 'Looking forward to the game!',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      message: 'Should I bring extra water?',
      timestamp: new Date(Date.now() - 1800000)
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  /**
   * Handles sending a new message
   * TODO: Integrate with backend API for real-time messaging
   */
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // TODO: Send message to backend API
    console.log('Sending message to backend:', {
      reservationId,
      message: message.message
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-teal-600" />
            Game Chat - {gameName}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 border rounded-lg">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex gap-3 ${
                    message.userId === currentUserId ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                      {getInitials(message.userName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[70%] ${
                    message.userId === currentUserId ? 'text-right' : ''
                  }`}>
                    <div className={`rounded-lg p-3 ${
                      message.userId === currentUserId
                        ? 'bg-teal-600 text-white ml-auto'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <p className="text-sm">{message.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{message.userName}</span>
                      <span>•</span>
                      <span>{format(message.timestamp, 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2 pt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerMessagesDialog;
