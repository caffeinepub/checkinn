import { useState } from 'react';
import { useListApprovals, useSetApproval, useGenerateInviteCode, useGetInviteCodes, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Check, X, Copy, Plus, Users, Link as LinkIcon } from 'lucide-react';
import { ApprovalStatus } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function AdminDashboard() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/10 backdrop-blur-md border border-white/20">
          <TabsTrigger value="approvals" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="invites" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <LinkIcon className="w-4 h-4 mr-2" />
            Invite Codes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          <ApprovalsTab />
        </TabsContent>

        <TabsContent value="invites" className="mt-6">
          <InvitesTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function ApprovalsTab() {
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();

  const handleApprove = async (principal: Principal) => {
    await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.approved });
  };

  const handleReject = async (principal: Principal) => {
    await setApproval.mutateAsync({ user: principal, status: ApprovalStatus.rejected });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  const pendingApprovals = approvals?.filter(a => a.status === ApprovalStatus.pending) || [];
  const approvedUsers = approvals?.filter(a => a.status === ApprovalStatus.approved) || [];
  const rejectedUsers = approvals?.filter(a => a.status === ApprovalStatus.rejected) || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-400">{pendingApprovals.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-400">{approvedUsers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-400">{rejectedUsers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.principal.toString()}
                  principal={approval.principal}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isPending={setApproval.isPending}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users Table */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/70">Principal</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals?.map((approval) => (
                <TableRow key={approval.principal.toString()} className="border-white/10">
                  <TableCell className="text-white/90 font-mono text-xs">
                    {approval.principal.toString().slice(0, 20)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        approval.status === ApprovalStatus.approved
                          ? 'bg-green-500'
                          : approval.status === ApprovalStatus.rejected
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }
                    >
                      {approval.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovalCard({
  principal,
  onApprove,
  onReject,
  isPending,
}: {
  principal: Principal;
  onApprove: (p: Principal) => void;
  onReject: (p: Principal) => void;
  isPending: boolean;
}) {
  const { data: profile } = useGetUserProfile(principal);

  if (!profile) {
    return (
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-white/50">Loading profile...</p>
      </div>
    );
  }

  const photoUrl = profile.photo.getDirectURL();

  return (
    <div className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
      <img
        src={photoUrl}
        alt={profile.name}
        className="w-20 h-20 rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">
          {profile.name}, {profile.age}
        </h3>
        <p className="text-white/60 text-sm">{profile.creativeFieldText}</p>
        <p className="text-white/80 text-sm mt-1">{profile.bio}</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onApprove(principal)}
          disabled={isPending}
          className="bg-green-500 hover:bg-green-600"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onReject(principal)}
          disabled={isPending}
          variant="destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function InvitesTab() {
  const { data: inviteCodes, isLoading } = useGetInviteCodes();
  const generateCode = useGenerateInviteCode();

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  const unusedCodes = inviteCodes?.filter(c => !c.used) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Generate Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => generateCode.mutate()}
            disabled={generateCode.isPending}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {generateCode.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate New Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Active Invite Codes ({unusedCodes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unusedCodes.length === 0 ? (
            <p className="text-white/50">No active invite codes</p>
          ) : (
            <div className="space-y-3">
              {unusedCodes.map((invite) => (
                <div
                  key={invite.code}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-mono">{invite.code}</p>
                    <p className="text-white/50 text-xs">
                      Created: {new Date(Number(invite.created / BigInt(1000000))).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCopyLink(invite.code)}
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
