import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Share2, 
  Crown, 
  UserPlus, 
  Copy, 
  MessageSquare,
  Star,
  Eye,
  Settings,
  Download,
  Upload,
  Zap,
  Shield,
  FileText,
  Activity
} from "lucide-react";

const teamMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'Admin',
    avatar: null,
    rulesShared: 12,
    rulesUsed: 8,
    joinedAt: '2025-01-01',
    lastActive: '2 hours ago',
    permissions: ['create', 'edit', 'delete', 'share']
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    role: 'Editor',
    avatar: null,
    rulesShared: 7,
    rulesUsed: 15,
    joinedAt: '2025-01-02',
    lastActive: '1 day ago',
    permissions: ['create', 'edit', 'share']
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'Viewer',
    avatar: null,
    rulesShared: 3,
    rulesUsed: 12,
    joinedAt: '2025-01-03',
    lastActive: '3 hours ago',
    permissions: ['view']
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@company.com',
    role: 'Editor',
    avatar: null,
    rulesShared: 9,
    rulesUsed: 6,
    joinedAt: '2025-01-01',
    lastActive: '5 hours ago',
    permissions: ['create', 'edit', 'share']
  }
];

const sharedRules = [
  {
    id: '1',
    name: 'Client Follow-up Automation',
    description: 'Automatically follow up with clients who haven\'t responded in 3 days',
    creator: 'Sarah Johnson',
    category: 'Follow-up',
    usageCount: 23,
    rating: 4.8,
    isPublic: true,
    tags: ['client', 'follow-up', 'sales'],
    createdAt: '2025-01-01',
    lastUpdated: '2025-01-05'
  },
  {
    id: '2',
    name: 'Meeting Request Handler',
    description: 'Smart detection and booking of meeting requests with calendar integration',
    creator: 'Mike Chen',
    category: 'Scheduling',
    usageCount: 31,
    rating: 4.9,
    isPublic: false,
    tags: ['meetings', 'calendar', 'scheduling'],
    createdAt: '2025-01-02',
    lastUpdated: '2025-01-04'
  },
  {
    id: '3',
    name: 'Priority Email Classifier',
    description: 'Automatically classify emails by priority and urgency level',
    creator: 'Emily Davis',
    category: 'Organization',
    usageCount: 18,
    rating: 4.6,
    isPublic: true,
    tags: ['priority', 'classification', 'organization'],
    createdAt: '2025-01-03',
    lastUpdated: '2025-01-06'
  },
  {
    id: '4',
    name: 'Invoice Processing Automation',
    description: 'Detect, extract, and organize invoice emails with payment tracking',
    creator: 'David Wilson',
    category: 'Finance',
    usageCount: 15,
    rating: 4.7,
    isPublic: false,
    tags: ['invoices', 'finance', 'payment'],
    createdAt: '2025-01-04',
    lastUpdated: '2025-01-07'
  }
];

const teamStats = {
  totalRules: 47,
  sharedRules: 23,
  activeUsers: 12,
  timeSaved: '34.5h',
  topCategory: 'Follow-up',
  avgRating: 4.7
};

export default function TeamCollaboration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const { toast } = useToast();

  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Simulate invitation
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { email, role };
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: "Team member invitation has been sent successfully.",
      });
      setInviteEmail('');
    }
  });

  const copyRule = (rule: any) => {
    toast({
      title: "Rule Copied!",
      description: `"${rule.name}" has been copied to your automation rules.`,
    });
  };

  const shareRule = (rule: any) => {
    navigator.clipboard.writeText(`Check out this awesome automation rule: ${rule.name}`);
    toast({
      title: "Share Link Copied!",
      description: "Rule share link copied to clipboard.",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Follow-up': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Scheduling': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Organization': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Finance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-500" />
              Team Collaboration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share automation rules, collaborate with team members, and boost collective productivity
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="viewer">Viewer - Can view and use shared rules</option>
                    <option value="editor">Editor - Can create, edit, and share rules</option>
                    <option value="admin">Admin - Full access and team management</option>
                  </select>
                </div>
                <Button
                  onClick={() => inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail || inviteMemberMutation.isPending}
                  className="w-full"
                >
                  {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.totalRules}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared Rules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.sharedRules}</p>
                </div>
                <Share2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.activeUsers}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.timeSaved}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Category</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{teamStats.topCategory}</p>
                </div>
                <Crown className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {teamStats.avgRating}
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="rules">Shared Rules</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Share2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah shared "Client Follow-up Automation"</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Mike used "Meeting Request Handler"</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Emily rated "Priority Email Classifier" 5 stars</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Rules */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Top Performing Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sharedRules.slice(0, 3).map((rule, index) => (
                    <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{rule.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(rule.category)}>{rule.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">{rule.rating}</span>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{rule.usageCount} uses</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sharedRules.map((rule) => (
                <Card key={rule.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">by {rule.creator}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {rule.isPublic ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(rule.category)}>{rule.category}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{rule.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {rule.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      <p>Used {rule.usageCount} times</p>
                      <p>Updated {rule.lastUpdated}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => copyRule(rule)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Use Rule
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareRule(rule)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                      </div>
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{member.rulesShared}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rules Shared</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{member.rulesUsed}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rules Used</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <p>Joined: {member.joinedAt}</p>
                      <p>Last active: {member.lastActive}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}