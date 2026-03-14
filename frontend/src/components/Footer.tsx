import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-white/70 text-sm">
          © 2025. Built with <Heart className="w-4 h-4 inline text-pink-400 fill-pink-400" /> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
