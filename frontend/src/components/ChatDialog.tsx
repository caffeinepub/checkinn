import { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetUserProfile, useGetMessages, useSendMessage } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ChatDialogProps {
  otherUser: Principal;
  onClose: () => void;
}

export default function ChatDialog({ otherUser, onClose }: ChatDialogProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile(otherUser);
  const { data: messages, isLoading } = useGetMessages(otherUser);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserPrincipal = identity?.getPrincipal().toString();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage.mutateAsync({
        receiver: otherUser,
        content: messageText,
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {profile ? `${profile.name}` : 'Loading...'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96 pr-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isCurrentUser = msg.sender.toString() === currentUserPrincipal;
                return (
                  <div
                    key={idx}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(Number(msg.timestamp / BigInt(1000000))).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              No messages yet. Start the conversation!
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2 mt-4">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button
            type="submit"
            disabled={sendMessage.isPending || !messageText.trim()}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
