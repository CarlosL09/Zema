import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Search, 
  Eye, 
  Check, 
  X, 
  AlertTriangle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Ban,
  Unlock,
  Trash2,
  Archive,
  Flag
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuarantinedEmail {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  preview: string;
  quarantinedAt: string;
  reason: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  threatTypes: string[];
  confidence: number;
  ruleTriggered: string;
  fullContent?: string;
  attachments?: Array<{ name: string; type: string; size: number }>;
  status: 'quarantined' | 'reviewed' | 'released' | 'deleted';
}

export default function Quarantine() {
  const [selectedEmail, setSelectedEmail] = useState<QuarantinedEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [threatFilter, setThreatFilter] = useState("all");
  const [confirmAction, setConfirmAction] = useState<{ action: string; email: QuarantinedEmail } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quarantined emails
  const { data: quarantinedEmails, isLoading } = useQuery({
    queryKey: ['/api/quarantine'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/quarantine');
      return response.json();
    }
  });

  // Mock data for demonstration
  const mockQuarantinedEmails: QuarantinedEmail[] = [
    {
      id: "q1",
      subject: "URGENT: Your PayPal account will be suspended!",
      sender: "PayPal Security",
      senderEmail: "security@payp4l-verification.com",
      preview: "We have detected suspicious activity on your account. Click here immediately to verify...",
      quarantinedAt: "2025-01-05 14:30",
      reason: "Phishing attempt - Domain spoofing detected",
      threatLevel: "critical",
      threatTypes: ["phishing", "domain_spoofing"],
      confidence: 0.95,
      ruleTriggered: "Domain spoofing detection",
      status: "quarantined",
      fullContent: "Dear PayPal User,\n\nWe have detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your identity immediately.\n\nClick here to verify: http://payp4l-verification.com/verify\n\nThank you,\nPayPal Security Team",
      attachments: []
    },
    {
      id: "q2",
      subject: "You've won $1,000,000! Claim now!",
      sender: "Lottery Commission",
      senderEmail: "winner@mega-lottery-2025.tk",
      preview: "CONGRATULATIONS! You have been selected as the lucky winner of our international lottery!",
      quarantinedAt: "2025-01-05 12:15",
      reason: "Lottery scam - Suspicious domain and content",
      threatLevel: "high",
      threatTypes: ["scam", "financial_fraud"],
      confidence: 0.92,
      ruleTriggered: "Lottery scam detection",
      status: "quarantined",
      fullContent: "CONGRATULATIONS!\n\nYou have been selected as the lucky winner of our international lottery! To claim your prize of $1,000,000, please reply with your bank details and a processing fee of $500.\n\nClaim now before it expires!",
      attachments: []
    },
    {
      id: "q3",
      subject: "Invoice_2025_malware.exe",
      sender: "Accounting Dept",
      senderEmail: "accounting@suspicious-domain.ml",
      preview: "Please find attached invoice for your review and payment...",
      quarantinedAt: "2025-01-05 09:45",
      reason: "Malicious attachment - Executable file",
      threatLevel: "critical",
      threatTypes: ["malware", "executable"],
      confidence: 0.98,
      ruleTriggered: "Dangerous file extension blocker",
      status: "quarantined",
      fullContent: "Dear Sir/Madam,\n\nPlease find attached invoice for your immediate review and payment. Download and run the attachment to view the invoice.\n\nBest regards,\nAccounting Department",
      attachments: [
        { name: "Invoice_2025_malware.exe", type: "application/octet-stream", size: 2048000 }
      ]
    },
    {
      id: "q4",
      subject: "Your Microsoft account needs verification",
      sender: "Microsoft Security",
      senderEmail: "security@microsft-support.net",
      preview: "Your account security is at risk. Please verify immediately to avoid suspension...",
      quarantinedAt: "2025-01-04 16:20",
      reason: "Phishing - Microsoft impersonation",
      threatLevel: "high",
      threatTypes: ["phishing", "impersonation"],
      confidence: 0.88,
      ruleTriggered: "Account verification flag",
      status: "reviewed",
      fullContent: "Dear Microsoft User,\n\nWe have detected unusual activity on your Microsoft account. Please verify your account details immediately to prevent suspension.\n\nVerify here: http://microsft-support.net/verify\n\nMicrosoft Security Team",
      attachments: []
    },
    {
      id: "q5",
      subject: "Free cryptocurrency investment opportunity",
      sender: "Crypto Advisor",
      senderEmail: "advisor@crypto-profits.ga",
      preview: "Make millions with our exclusive cryptocurrency trading bot! Limited time offer...",
      quarantinedAt: "2025-01-04 11:30",
      reason: "Financial scam - Suspicious domain",
      threatLevel: "medium",
      threatTypes: ["scam", "investment_fraud"],
      confidence: 0.75,
      ruleTriggered: "Suspicious domain warning",
      status: "released",
      fullContent: "Hello!\n\nMake millions with our exclusive cryptocurrency trading bot! Join thousands of successful investors who are already making huge profits!\n\nInvest now and get 500% returns guaranteed!\n\nClick here to start: http://crypto-profits.ga/invest",
      attachments: []
    }
  ];

  const displayEmails = quarantinedEmails || mockQuarantinedEmails;

  // Filter emails
  const filteredEmails = displayEmails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.senderEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    const matchesThreat = threatFilter === "all" || email.threatLevel === threatFilter;
    
    return matchesSearch && matchesStatus && matchesThreat;
  });

  // Mutations
  const releaseEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest('POST', `/api/quarantine/${emailId}/release`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quarantine'] });
      toast({
        title: "Email Released",
        description: "The email has been moved back to your inbox."
      });
    }
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest('DELETE', `/api/quarantine/${emailId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quarantine'] });
      toast({
        title: "Email Deleted",
        description: "The email has been permanently deleted."
      });
    }
  });

  const markReviewedMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest('PATCH', `/api/quarantine/${emailId}/reviewed`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quarantine'] });
      toast({
        title: "Email Marked as Reviewed",
        description: "The email has been marked as reviewed."
      });
    }
  });

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quarantined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'released': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'deleted': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleAction = (action: string, email: QuarantinedEmail) => {
    if (action === 'release' || action === 'delete') {
      setConfirmAction({ action, email });
    } else if (action === 'review') {
      markReviewedMutation.mutate(email.id);
    }
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;

    if (confirmAction.action === 'release') {
      releaseEmailMutation.mutate(confirmAction.email.id);
    } else if (confirmAction.action === 'delete') {
      deleteEmailMutation.mutate(confirmAction.email.id);
    }
    
    setConfirmAction(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Quarantine</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and manage quarantined emails flagged by security rules
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Quarantined</p>
                <p className="text-2xl font-bold">{displayEmails.length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Threats</p>
                <p className="text-2xl font-bold text-red-600">
                  {displayEmails.filter(e => e.threatLevel === 'critical').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {displayEmails.filter(e => e.status === 'quarantined').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {displayEmails.filter(e => new Date(e.quarantinedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quarantined emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={threatFilter} onValueChange={setThreatFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threats</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quarantined Emails List */}
      <div className="space-y-4">
        {filteredEmails.map((email) => (
          <Card key={email.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold">{email.subject}</h3>
                    <Badge className={getThreatLevelColor(email.threatLevel)}>
                      {email.threatLevel.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(email.status)}>
                      {email.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{email.sender} ({email.senderEmail})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{email.quarantinedAt}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {email.preview}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Reason:</strong> {email.reason}
                    </div>
                    <div className="text-sm">
                      <strong>Rule:</strong> {email.ruleTriggered}
                    </div>
                    <div className="text-sm">
                      <strong>Confidence:</strong> {Math.round(email.confidence * 100)}%
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <strong>Threats:</strong>
                      {email.threatTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    {email.attachments && email.attachments.length > 0 && (
                      <div className="text-sm text-red-600">
                        <strong>⚠️ {email.attachments.length} attachment(s) - potentially dangerous</strong>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {email.status === 'quarantined' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('review', email)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        <Flag className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('release', email)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Release
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('delete', email)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmails.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quarantined emails found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== "all" || threatFilter !== "all"
                ? "Try adjusting your filters to see more emails."
                : "Great! No emails are currently in quarantine."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Email Details Dialog */}
      <Dialog open={selectedEmail !== null} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Quarantined Email Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">From</Label>
                  <p className="text-sm">{selectedEmail.sender} ({selectedEmail.senderEmail})</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quarantined</Label>
                  <p className="text-sm">{selectedEmail.quarantinedAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Threat Level</Label>
                  <Badge className={getThreatLevelColor(selectedEmail.threatLevel)}>
                    {selectedEmail.threatLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedEmail.status)}>
                    {selectedEmail.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {selectedEmail.subject}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Quarantine Reason</Label>
                <p className="text-sm">{selectedEmail.reason}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Triggered Rule</Label>
                <p className="text-sm">{selectedEmail.ruleTriggered}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Threat Types</Label>
                <div className="flex gap-2 mt-1">
                  {selectedEmail.threatTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments (⚠️ Potentially Dangerous)</Label>
                  <div className="space-y-2 mt-1">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-mono">{attachment.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(attachment.size / 1024)} KB
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Email Content</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-1">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {selectedEmail.fullContent}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                  Close
                </Button>
                {selectedEmail.status === 'quarantined' && (
                  <>
                    <Button
                      onClick={() => {
                        handleAction('review', selectedEmail);
                        setSelectedEmail(null);
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                    <Button
                      onClick={() => {
                        handleAction('release', selectedEmail);
                        setSelectedEmail(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Release to Inbox
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    handleAction('delete', selectedEmail);
                    setSelectedEmail(null);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {confirmAction?.action === 'release' ? 'Release' : 'Delete'} Email
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'release' 
                ? `Are you sure you want to release "${confirmAction.email.subject}" back to your inbox? This email was quarantined due to security concerns.`
                : `Are you sure you want to permanently delete "${confirmAction?.email.subject}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActionHandler}
              className={confirmAction?.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {confirmAction?.action === 'release' ? 'Release' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}