import { useState } from 'react';
import { useGetMatches, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import ChatDialog from './ChatDialog';

export default function MatchesTab() {
  const { data: matchPrincipals, isLoading } = useGetMatches();
  const [selectedMatch, setSelectedMatch] = useState<Principal | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!matchPrincipals || matchPrincipals.length === 0) {
    return (
      <div className="text-center py-16">
        <img
          src="/assets/generated/no-matches.dim_400x300.png"
          alt="No matches"
          className="w-64 h-48 mx-auto mb-4 rounded-lg opacity-50"
        />
        <p className="text-white/70 text-lg">No matches yet</p>
        <p className="text-white/50 text-sm mt-2">Start swiping to find your connections</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchPrincipals.map((principal) => (
          <MatchCard
            key={principal.toString()}
            principal={principal}
            onMessage={() => setSelectedMatch(principal)}
          />
        ))}
      </div>

      {selectedMatch && (
        <ChatDialog
          otherUser={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}

function MatchCard({ principal, onMessage }: { principal: Principal; onMessage: () => void }) {
  const { data: profile, isLoading } = useGetUserProfile(principal);

  if (isLoading || !profile) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="w-full h-48 bg-white/20 rounded-lg mb-3" />
            <div className="h-4 bg-white/20 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/20 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const photoUrl = profile.photo.getDirectURL();

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden hover:border-pink-400/50 transition-colors">
      <img
        src={photoUrl}
        alt={profile.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-white mb-1">
          {profile.name}, {profile.age}
        </h3>
        <p className="text-white/60 text-sm mb-3">{profile.creativeFieldText}</p>
        <Button
          onClick={onMessage}
          className="w-full bg-pink-500 hover:bg-pink-600"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      </CardContent>
    </Card>
  );
}
