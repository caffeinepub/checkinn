import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function ApprovalPending() {
  return (
    <main className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Clock className="w-16 h-16 text-pink-400" />
          </div>
          <CardTitle className="text-3xl text-white">Approval Pending</CardTitle>
          <CardDescription className="text-white/70 text-lg">
            Your profile is under review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 mb-4">
            Thank you for your interest in joining Raya. Our team is currently reviewing your profile
            to ensure it meets our community standards.
          </p>
          <p className="text-white/60 text-sm">
            You'll receive access once your profile is approved. This usually takes 24-48 hours.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
