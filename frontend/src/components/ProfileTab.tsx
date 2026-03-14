import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function ProfileTab() {
  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70">No profile found</p>
      </div>
    );
  }

  const photoUrl = profile.photo.getDirectURL();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
        <div className="relative">
          <img
            src={photoUrl}
            alt={profile.name}
            className="w-full h-96 object-cover"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-3xl text-white">
            {profile.name}, {profile.age}
          </CardTitle>
          <Badge className="bg-pink-500 text-white w-fit">
            {profile.creativeFieldText}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">About</h3>
              <p className="text-white/80">{profile.bio}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Gender</h3>
              <p className="text-white/80 capitalize">{profile.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
