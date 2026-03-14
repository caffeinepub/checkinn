import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerApproved, useIsCurrentUserAdmin } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetup from './components/ProfileSetup';
import ApprovalPending from './components/ApprovalPending';
import AdminDashboard from './components/AdminDashboard';
import MainApp from './components/MainApp';
import LandingPage from './components/LandingPage';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  const isAuthenticated = !!identity;

  // Show loading state while initializing
  if (isInitializing || (isAuthenticated && (profileLoading || approvalLoading))) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <LandingPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Authenticated but no profile - show profile setup
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;
  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
          <Header />
          <ProfileSetup />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Admin always has access
  if (isAdmin) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
          <Header />
          <AdminDashboard />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // User not approved - show pending state
  if (!isApproved) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
          <Header />
          <ApprovalPending />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Approved user - show main app
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900">
        <Header />
        <MainApp />
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
