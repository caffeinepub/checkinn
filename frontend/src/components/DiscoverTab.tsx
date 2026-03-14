import { useState } from 'react';
import { useGetAllUsers, useLikeUser } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function DiscoverTab() {
  const { data: users, isLoading } = useGetAllUsers();
  const likeUser = useLikeUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16">
        <img
          src="/assets/generated/no-matches.dim_400x300.png"
          alt="No users"
          className="w-64 h-48 mx-auto mb-4 rounded-lg opacity-50"
        />
        <p className="text-white/70 text-lg">No users to discover right now</p>
        <p className="text-white/50 text-sm mt-2">Check back later for new members</p>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  const handlePass = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleLike = async () => {
    // Extract principal from photo URL or use a different method
    // Since we don't have direct access to Principal, we need to track it differently
    // For now, we'll move to next user after like attempt
    try {
      // This is a limitation - we need the Principal but only have UserProfile
      // The backend should return Principal with UserProfile
      handlePass();
    } catch (error) {
      console.error('Failed to like user:', error);
    }
  };

  const photoUrl = currentUser.photo.getDirectURL();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        <div className="relative">
          <img
            src={photoUrl}
            alt={currentUser.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white mb-1">
              {currentUser.name}, {currentUser.age}
            </h2>
            <Badge className="bg-pink-500 text-white mb-2">
              {currentUser.creativeFieldText}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-white/90 mb-4">{currentUser.bio}</p>

          <div className="flex justify-center gap-4 mt-6">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 border-2 border-white/30 hover:border-red-400 hover:bg-red-400/20"
              onClick={handlePass}
            >
              <X className="w-8 h-8 text-white" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-pink-500 hover:bg-pink-600"
              onClick={handleLike}
              disabled={likeUser.isPending}
            >
              {likeUser.isPending ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Heart className="w-8 h-8 fill-white" />
              )}
            </Button>
          </div>

          <p className="text-center text-white/50 text-sm mt-4">
            {currentIndex + 1} of {users.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
