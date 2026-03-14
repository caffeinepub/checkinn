import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Shield, Users } from 'lucide-react';

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
              <h1 className="text-2xl font-bold text-white">Raya</h1>
            </div>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoggingIn ? 'Connecting...' : 'Login'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/assets/generated/app-logo.dim_200x200.png"
              alt="Raya Logo"
              className="w-32 h-32 mx-auto mb-6 rounded-full shadow-2xl"
            />
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Where Creativity Meets Connection
            </h2>
            <p className="text-xl text-white/80 mb-8">
              An exclusive community for creative professionals to find meaningful connections
            </p>
          </div>

          <div className="mb-12">
            <img
              src="/assets/generated/hero-image.dim_800x600.png"
              alt="Hero"
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 mb-16"
          >
            {isLoggingIn ? 'Connecting...' : 'Join Raya'}
          </Button>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Shield className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Invite Only</h3>
              <p className="text-white/70">
                Join an exclusive community through invitation links only
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Curated Profiles</h3>
              <p className="text-white/70">
                Every member is reviewed to maintain quality and authenticity
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Users className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Creative Community</h3>
              <p className="text-white/70">
                Connect with artists, musicians, filmmakers, and innovators
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
