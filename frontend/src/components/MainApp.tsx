import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, User } from 'lucide-react';
import DiscoverTab from './DiscoverTab';
import MatchesTab from './MatchesTab';
import ProfileTab from './ProfileTab';

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20">
          <TabsTrigger value="discover" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <Heart className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <DiscoverTab />
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <MatchesTab />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
