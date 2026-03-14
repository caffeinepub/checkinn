import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, User } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
            <h1 className="text-2xl font-bold text-white">Checkinn</h1>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {userProfile && (
                <div className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{userProfile.name}</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
