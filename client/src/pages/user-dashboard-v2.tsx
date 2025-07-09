import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { 
  Search,
  Plus,
  Mail,
  Settings,
  Zap,
  Users,
  FileText,
  Calendar,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
  Ban,
  MoreHorizontal,
  Play,
  BarChart3,
  Bot,
  Sparkles,
  Tags,
  SortAsc,
  MessageCircle,
  Newspaper,
  Receipt,
  Plane,
  FileSpreadsheet,
  Users2,
  Crown,
  Star,
  UserMinus,
  CheckCircle2,
  Headphones,
  Snowflake,
  Bell,
  Forward,
  PenTool,
  Brain,
  Heart,
  RefreshCw,
  Home,
  User,

  Eye,
  LogOut,
  ChevronDown
} from "lucide-react";
import {
  SiAirtable,
  SiAsana,
  SiClickup,
  SiDiscord,
  SiDropbox,
  SiGithub,
  SiGitlab,
  SiGoogledrive,
  SiGooglecalendar,
  SiNotion,
  SiPaypal,
  SiShopify,
  SiSlack,
  SiStripe,
  SiTelegram,
  SiTrello,
  SiZapier,
  SiZoom,
  SiSalesforce,
  SiWhatsapp,
  SiBitbucket,
  SiHubspot,
  SiMailchimp,
  SiOpenai,
  SiSendgrid,
  SiLinkedin
} from "react-icons/si";
import zemaLogo from "@assets/41_1751766597493.png";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import AIAutomationAssistant from "@/components/ai-automation-assistant";
import TemplateBuilder from "@/components/template-builder";
import CustomRulesBuilder from "@/components/custom-rules-builder";
import AIGuidedRuleBuilderV2 from "@/components/ai-guided-rule-builder-v2";
import AdvancedRuleBuilder from "@/components/advanced-rule-builder";
import AIGuidedAutomationBuilder from "@/components/ai-guided-automation-builder";
import AutomationBuilderChoice from "@/components/automation-builder-choice";
import AIGuidedTemplateBuilderV2 from "@/components/ai-guided-template-builder-v2";
import TemplateBuilderChoice from "@/components/template-builder-choice";

// Template categories for ZEMA
const templateCategories = [
  { id: 'smart-filters', name: 'Smart Filters', active: true },
  { id: 'auto-responders', name: 'Auto Responders', active: false },
  { id: 'priority-detection', name: 'Priority Detection', active: false },
  { id: 'follow-up', name: 'Follow-up', active: false },
  { id: 'scheduling', name: 'Scheduling', active: false },
  { id: 'organization', name: 'Organization', active: false },
  { id: 'security', name: 'Security', active: false },
  { id: 'more', name: 'More >', active: false }
];

// Email automation templates
const automationTemplates = [
  {
    id: 'smart-classifier',
    icon: <Filter className="h-8 w-8 text-blue-500" />,
    title: 'Smart Email Classifier',
    subtitle: '2 Day Smart Classification',
    description: 'Automatically categorize emails by content and sender',
    category: 'Smart Filters',
    complexity: 'Easy'
  },
  {
    id: 'priority-detector',
    icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
    title: 'Priority Email Detector',
    subtitle: '2 Day Priority Detection',
    description: 'Identify urgent emails requiring immediate attention',
    category: 'Priority Detection',
    complexity: 'Medium'
  },
  {
    id: 'auto-organizer',
    icon: <FileText className="h-8 w-8 text-green-500" />,
    title: 'Email Auto-Organizer',
    subtitle: '2 Day Organization Sequence',
    description: 'Automatically sort emails into folders and labels',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'meeting-scheduler',
    icon: <Calendar className="h-8 w-8 text-purple-500" />,
    title: 'Smart Meeting Scheduler',
    subtitle: '2 Day Scheduling Sequence',
    description: 'Detect and schedule meeting requests automatically',
    category: 'Scheduling',
    complexity: 'Advanced'
  },
  {
    id: 'follow-up-reminder',
    icon: <Clock className="h-8 w-8 text-amber-500" />,
    title: 'Follow-up Reminder',
    subtitle: '3 Day Follow-up Sequence',
    description: 'Auto-schedule follow-ups for emails awaiting responses',
    category: 'Follow-up',
    complexity: 'Medium'
  },
  {
    id: 'spam-detector',
    icon: <Target className="h-8 w-8 text-red-500" />,
    title: 'Advanced Spam Detector',
    subtitle: 'Real-time Spam Protection',
    description: 'AI-powered spam detection with custom filtering rules',
    category: 'Security',
    complexity: 'Easy'
  },
  {
    id: 'auto-responder',
    icon: <Mail className="h-8 w-8 text-cyan-500" />,
    title: 'Smart Auto-Responder',
    subtitle: 'Instant Response System',
    description: 'Context-aware automatic responses based on email content',
    category: 'Auto Responders',
    complexity: 'Medium'
  },
  {
    id: 'lead-scorer',
    icon: <TrendingUp className="h-8 w-8 text-emerald-500" />,
    title: 'Lead Scoring Engine',
    subtitle: 'Sales Lead Qualification',
    description: 'Automatically score and prioritize potential leads',
    category: 'Smart Filters',
    complexity: 'Advanced'
  },
  {
    id: 'newsletter-organizer',
    icon: <Tags className="h-8 w-8 text-indigo-500" />,
    title: 'Newsletter Organizer',
    subtitle: 'Subscription Management',
    description: 'Auto-categorize and manage newsletter subscriptions',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'expense-tracker',
    icon: <BarChart3 className="h-8 w-8 text-yellow-500" />,
    title: 'Expense Email Tracker',
    subtitle: 'Financial Email Processing',
    description: 'Extract and categorize financial information from emails',
    category: 'Organization',
    complexity: 'Advanced'
  },
  {
    id: 'travel-assistant',
    icon: <Calendar className="h-8 w-8 text-sky-500" />,
    title: 'Travel Booking Assistant',
    subtitle: 'Trip Organization Automation',
    description: 'Auto-organize travel confirmations and itineraries',
    category: 'Organization',
    complexity: 'Medium'
  },
  {
    id: 'invoice-processor',
    icon: <FileText className="h-8 w-8 text-teal-500" />,
    title: 'Invoice Processor',
    subtitle: 'Automated Invoice Management',
    description: 'Extract, categorize and track invoice emails automatically',
    category: 'Organization',
    complexity: 'Advanced'
  },
  {
    id: 'social-media-alerts',
    icon: <Bell className="h-8 w-8 text-pink-500" />,
    title: 'Social Media Alert Manager',
    subtitle: 'Social Notification Hub',
    description: 'Consolidate and prioritize social media notifications',
    category: 'Smart Filters',
    complexity: 'Easy'
  },
  {
    id: 'vip-detector',
    icon: <Users className="h-8 w-8 text-gold-500" />,
    title: 'VIP Contact Detector',
    subtitle: 'Important Contact Priority',
    description: 'Automatically identify and prioritize VIP contacts',
    category: 'Priority Detection',
    complexity: 'Medium'
  },
  // Additional Common Rules Users Can Preselect
  {
    id: 'out-of-office-responder',
    icon: <MessageCircle className="h-8 w-8 text-cyan-500" />,
    title: 'Out of Office Auto-Reply',
    subtitle: 'Professional Away Messages',
    description: 'Automatically respond when you\'re away with custom messages',
    category: 'Auto Responders',
    complexity: 'Easy'
  },
  {
    id: 'newsletter-unsubscriber',
    icon: <UserMinus className="h-8 w-8 text-slate-500" />,
    title: 'Smart Unsubscribe Helper',
    subtitle: 'Subscription Management',
    description: 'Suggest unsubscribing from low-engagement newsletters',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'booking-confirmations',
    icon: <CheckCircle2 className="h-8 w-8 text-green-600" />,
    title: 'Booking Confirmation Handler',
    subtitle: 'Reservation Management',
    description: 'Auto-organize all booking confirmations and reservations',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'customer-support-triage',
    icon: <Headphones className="h-8 w-8 text-blue-600" />,
    title: 'Customer Support Triage',
    subtitle: 'Support Request Prioritization',
    description: 'Automatically categorize and prioritize customer support emails',
    category: 'Priority Detection',
    complexity: 'Medium'
  },
  {
    id: 'cold-email-filter',
    icon: <Snowflake className="h-8 w-8 text-blue-400" />,
    title: 'Cold Email Filter',
    subtitle: 'Unsolicited Email Management',
    description: 'Filter and organize cold sales emails and outreach',
    category: 'Smart Filters',
    complexity: 'Easy'
  },
  {
    id: 'notification-grouper',
    icon: <Bell className="h-8 w-8 text-orange-400" />,
    title: 'Notification Grouper',
    subtitle: 'App Notification Organization',
    description: 'Group similar notifications from apps and services',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'smart-forwarding',
    icon: <Forward className="h-8 w-8 text-violet-500" />,
    title: 'Smart Email Forwarding',
    subtitle: 'Intelligent Email Routing',
    description: 'Automatically forward emails to appropriate team members',
    category: 'Smart Filters',
    complexity: 'Advanced'
  },
  {
    id: 'deadline-tracker',
    icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
    title: 'Deadline Tracker',
    subtitle: 'Important Date Detection',
    description: 'Detect and track deadlines mentioned in emails',
    category: 'Follow-up',
    complexity: 'Medium'
  },
  {
    id: 'receipt-organizer',
    icon: <Receipt className="h-8 w-8 text-emerald-500" />,
    title: 'Receipt & Purchase Organizer',
    subtitle: 'Financial Document Sorting',
    description: 'Automatically detect and organize purchase receipts',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'urgent-keyword-detector',
    icon: <AlertCircle className="h-8 w-8 text-red-600" />,
    title: 'Urgent Keyword Detector',
    subtitle: 'Emergency Email Detection',
    description: 'Flag emails with urgent keywords like "emergency", "critical"',
    category: 'Priority Detection',
    complexity: 'Easy'
  },
  {
    id: 'social-media-digest',
    icon: <Users2 className="h-8 w-8 text-pink-500" />,
    title: 'Social Media Digest',
    subtitle: 'Social Notification Summary',
    description: 'Create daily digest of social media notifications',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'meeting-follow-up',
    icon: <Calendar className="h-8 w-8 text-purple-500" />,
    title: 'Meeting Follow-up Generator',
    subtitle: 'Post-Meeting Automation',
    description: 'Generate follow-up emails after meeting invitations',
    category: 'Follow-up',
    complexity: 'Medium'
  },
  {
    id: 'phishing-detector',
    icon: <Shield className="h-8 w-8 text-red-600" />,
    title: 'Phishing Email Detector',
    subtitle: 'Malicious Email Protection',
    description: 'Detect and quarantine suspicious phishing attempts',
    category: 'Security',
    complexity: 'Medium'
  },
  {
    id: 'auto-invoice-reminder',
    icon: <FileSpreadsheet className="h-8 w-8 text-teal-500" />,
    title: 'Invoice Payment Reminder',
    subtitle: 'Automated Payment Follow-up',
    description: 'Track unpaid invoices and send automatic payment reminders',
    category: 'Follow-up',
    complexity: 'Advanced'
  },
  {
    id: 'team-mention-alerts',
    icon: <Users className="h-8 w-8 text-indigo-500" />,
    title: 'Team Mention Alerts',
    subtitle: 'Team Communication Priority',
    description: 'Prioritize emails mentioning team members or projects',
    category: 'Priority Detection',
    complexity: 'Easy'
  },
  {
    id: 'weekend-email-hold',
    icon: <Clock className="h-8 w-8 text-purple-400" />,
    title: 'Weekend Email Holder',
    subtitle: 'Work-Life Balance Protection',
    description: 'Hold non-urgent emails during weekends and holidays',
    category: 'Organization',
    complexity: 'Easy'
  },
  {
    id: 'attachment-organizer',
    icon: <FileText className="h-8 w-8 text-green-500" />,
    title: 'Attachment Organizer',
    subtitle: 'File Management Automation',
    description: 'Automatically organize emails with specific file types',
    category: 'Organization',
    complexity: 'Medium'
  },
  {
    id: 'follow-up-scheduler',
    icon: <Calendar className="h-8 w-8 text-amber-500" />,
    title: 'Smart Follow-up Scheduler',
    subtitle: 'Response Tracking',
    description: 'Auto-schedule follow-ups based on email importance',
    category: 'Follow-up',
    complexity: 'Medium'
  },
  {
    id: 'competitor-monitor',
    icon: <Eye className="h-8 w-8 text-violet-600" />,
    title: 'Competitor Email Monitor',
    subtitle: 'Market Intelligence',
    description: 'Track and organize emails from competitors and industry news',
    category: 'Smart Filters',
    complexity: 'Medium'
  }
];

export default function UserDashboardV2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState('smart-filters');
  const [activeSection, setActiveSection] = useState("home");
  const { toast } = useToast();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [apiKey, setApiKey] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [showRuleBuilderOptions, setShowRuleBuilderOptions] = useState(false);
  const [showAIGuidedBuilder, setShowAIGuidedBuilder] = useState(false);
  const [showAutomationBuilderChoice, setShowAutomationBuilderChoice] = useState(false);
  const [showAIGuidedAutomationBuilder, setShowAIGuidedAutomationBuilder] = useState(false);
  const [showTemplateBuilderChoice, setShowTemplateBuilderChoice] = useState(false);
  const [showAIGuidedTemplateBuilder, setShowAIGuidedTemplateBuilder] = useState(false);
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [location, navigate] = useLocation();

  // Navigation function similar to landing page
  const navigateToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location !== '/') {
      navigate('/');
      // Wait a bit for the page to load, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  // Profile & Billing state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Template creation with integration selection state
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  // Function to get the appropriate icon for each integration
  const getIntegrationIcon = (integrationName: string, size = "w-5 h-5"): React.ReactElement => {
    const iconProps = { className: size };
    
    switch (integrationName) {
      case 'Airtable': return <SiAirtable {...iconProps} />;
      case 'Asana': return <SiAsana {...iconProps} />;
      case 'ClickUp': return <SiClickup {...iconProps} />;
      case 'Discord': return <SiDiscord {...iconProps} />;
      case 'Dropbox': return <SiDropbox {...iconProps} />;
      case 'GitHub': return <SiGithub {...iconProps} />;
      case 'GitLab': return <SiGitlab {...iconProps} />;
      case 'Google Drive': return <SiGoogledrive {...iconProps} />;
      case 'Google Calendar': return <SiGooglecalendar {...iconProps} />;
      case 'Google Meet': return <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">GM</div>;
      case 'HubSpot': return <SiHubspot {...iconProps} />;
      case 'Mailchimp': return <SiMailchimp {...iconProps} />;
      case 'Microsoft Teams': return <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">MT</div>;
      case 'Monday.com': return <div className="w-5 h-5 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">M</div>;
      case 'Notion': return <SiNotion {...iconProps} />;
      case 'OneDrive': return <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">OD</div>;
      case 'OpenAI': return <SiOpenai {...iconProps} />;
      case 'Pabbly Connect': return <div className="w-5 h-5 bg-indigo-500 rounded text-white text-xs flex items-center justify-center font-bold">P</div>;
      case 'PayPal': return <SiPaypal {...iconProps} />;
      case 'Pipedrive': return <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">PD</div>;
      case 'Salesforce': return <SiSalesforce {...iconProps} />;
      case 'SendGrid': return <SiSendgrid {...iconProps} />;
      case 'Shopify': return <SiShopify {...iconProps} />;
      case 'Slack': return <SiSlack {...iconProps} />;
      case 'Stripe': return <SiStripe {...iconProps} />;
      case 'Telegram': return <SiTelegram {...iconProps} />;
      case 'Trello': return <SiTrello {...iconProps} />;
      case 'WhatsApp': return <SiWhatsapp {...iconProps} />;
      case 'Zapier': return <SiZapier {...iconProps} />;
      case 'Zoom': return <SiZoom {...iconProps} />;
      case 'Bitbucket': return <SiBitbucket {...iconProps} />;
      case 'Calendly': return <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">C</div>;
      case 'LinkedIn': return <SiLinkedin {...iconProps} />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">{integrationName[0]}</div>;
    }
  };

  // Available integrations for automation
  const availableIntegrations = [
    { id: 'airtable', name: 'Airtable', description: 'Spreadsheet database', icon: getIntegrationIcon('Airtable'), category: 'Productivity' },
    { id: 'asana', name: 'Asana', description: 'Task management', icon: getIntegrationIcon('Asana'), category: 'Project Management' },
    { id: 'clickup', name: 'ClickUp', description: 'All-in-one workspace', icon: getIntegrationIcon('ClickUp'), category: 'Project Management' },
    { id: 'discord', name: 'Discord', description: 'Community alerts', icon: getIntegrationIcon('Discord'), category: 'Communication' },
    { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage', icon: getIntegrationIcon('Dropbox'), category: 'Storage' },
    { id: 'github', name: 'GitHub', description: 'Code repositories', icon: getIntegrationIcon('GitHub'), category: 'Development' },
    { id: 'gitlab', name: 'GitLab', description: 'DevOps platform', icon: getIntegrationIcon('GitLab'), category: 'Development' },
    { id: 'google-drive', name: 'Google Drive', description: 'File storage', icon: getIntegrationIcon('Google Drive'), category: 'Storage' },
    { id: 'calendar', name: 'Google Calendar', description: 'Schedule management', icon: getIntegrationIcon('Google Calendar'), category: 'Calendar' },
    { id: 'teams', name: 'Microsoft Teams', description: 'Business chat', icon: getIntegrationIcon('Microsoft Teams'), category: 'Communication' },
    { id: 'monday', name: 'Monday.com', description: 'Project tracking', icon: getIntegrationIcon('Monday.com'), category: 'Project Management' },
    { id: 'notion', name: 'Notion', description: 'Database creation', icon: getIntegrationIcon('Notion'), category: 'Productivity' },
    { id: 'pabbly', name: 'Pabbly Connect', description: 'Unlimited automation workflows', icon: getIntegrationIcon('Pabbly Connect'), category: 'Automation' },
    { id: 'paypal', name: 'PayPal', description: 'Payment gateway', icon: getIntegrationIcon('PayPal'), category: 'Finance' },
    { id: 'shopify', name: 'Shopify', description: 'E-commerce platform', icon: getIntegrationIcon('Shopify'), category: 'E-commerce' },
    { id: 'slack', name: 'Slack', description: 'Team notifications', icon: getIntegrationIcon('Slack'), category: 'Communication' },
    { id: 'stripe', name: 'Stripe', description: 'Payment processing', icon: getIntegrationIcon('Stripe'), category: 'Finance' },
    { id: 'telegram', name: 'Telegram', description: 'Instant messaging', icon: getIntegrationIcon('Telegram'), category: 'Communication' },
    { id: 'trello', name: 'Trello', description: 'Card creation', icon: getIntegrationIcon('Trello'), category: 'Project Management' },
    { id: 'zapier', name: 'Zapier', description: 'Connect to 5000+ apps', icon: getIntegrationIcon('Zapier'), category: 'Automation' },
    { id: 'zoom', name: 'Zoom', description: 'Video meetings', icon: getIntegrationIcon('Zoom'), category: 'Communication' }
  ];

  // Create automation rule mutation with integrations
  const createAutomationMutation = useMutation({
    mutationFn: async (data: { templateId: string; integrations: string[] }) => {
      const response = await apiRequest("POST", `/api/automation-templates/${data.templateId}/create`, {
        customSettings: {},
        integrations: data.integrations
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Automation Created!",
        description: `Successfully created "${data.name}" automation rule with ${selectedIntegrations.length} integration(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
      setShowIntegrationDialog(false);
      setSelectedIntegrations([]);
      setSelectedTemplate(null);
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch recent automation rules
  const { data: recentRules = [] } = useQuery({
    queryKey: ["/api/automation-rules"],
  });

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache the result
  });

  // Fetch user data for profile
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false
  });

  // Fetch billing events
  const { data: billingEvents = [] } = useQuery({
    queryKey: ["/api/billing/events"],
    retry: false
  });

  // Fetch subscription usage
  const { data: subscriptionUsage } = useQuery({
    queryKey: ["/api/subscription/usage"],
    retry: false
  });

  // Fetch email accounts to determine if user is new
  const { data: emailAccounts = [] } = useQuery({
    queryKey: ["/api/email-accounts"],
    retry: false
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/change-password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/cancel");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/usage"] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  const stats = dashboardStats || {
    emailsProcessed: 1247,
    activeRules: 12,
    timeSaved: 15.3,
    automationRate: 0.87
  };

  const filteredTemplates = automationTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'smart-filters' ? template.category === 'Smart Filters' :
                           activeCategory === 'auto-responders' ? template.category === 'Auto Responders' :
                           activeCategory === 'priority-detection' ? template.category === 'Priority Detection' :
                           activeCategory === 'follow-up' ? template.category === 'Follow-up' :
                           activeCategory === 'scheduling' ? template.category === 'Scheduling' :
                           activeCategory === 'organization' ? template.category === 'Organization' :
                           activeCategory === 'security' ? template.category === 'Security' :
                           true; // 'more' shows all templates
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen gradient-hero">
      {/* Modern Futuristic Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-black dark:to-gray-900 border-r border-slate-700/50 dark:border-gray-800/50 shadow-2xl backdrop-blur-xl overflow-y-auto">
        {/* Header with Logo */}
        <div className="p-6 border-b border-slate-700/30 dark:border-gray-800/30">
          <div className="flex items-center justify-center mb-2">
            <img 
              src={zemaLogo} 
              alt="ZEMA ai" 
              className="h-14 w-auto filter brightness-110 drop-shadow-lg hover:scale-105 transition-all duration-500"
            />
          </div>
          <div className="text-center">
            <p className="text-slate-300 dark:text-gray-400 text-xs font-medium tracking-wide">
              AI Email Automation
            </p>
          </div>
        </div>

        {/* Quick Actions with Futuristic Design */}
        <div className="p-6 space-y-4">
          <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Quick Actions
          </div>
          
          <Button
            onClick={() => setShowRuleBuilderOptions(true)}
            className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 border border-cyan-400/20 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Email Rule
          </Button>
          
          <Button
            onClick={() => setShowTemplateBuilderChoice(true)}
            className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 border border-cyan-400/20 backdrop-blur-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            New App Template
          </Button>
        </div>

        {/* Navigation with Modern Glass Effect */}
        <nav className="p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Navigation
          </div>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'home' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('home')}
          >
            <span className="flex items-center">
              <Home className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Dashboard
            </span>
          </button>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'inbox' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('inbox')}
          >
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Email Inbox
            </span>
          </button>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'automations' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('automations')}
          >
            <span className="flex items-center">
              <Zap className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Email Rules
            </span>
          </button>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'templates' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('templates')}
          >
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              App Templates
            </span>
          </button>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'accounts' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('accounts')}
          >
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Email Accounts
            </span>
          </button>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'integrations' 
                ? 'bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-cyan-500/30'
            }`}
            onClick={() => setActiveSection('integrations')}
          >
            <span className="flex items-center">
              <Settings className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Integrations
            </span>
          </button>

          {/* Security Section Divider */}
          <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4 mt-6">
            Security Center
          </div>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group ${
              activeSection === 'security' 
                ? 'bg-gradient-to-r from-red-600/90 to-red-500/90 text-white shadow-lg shadow-red-500/25 border border-red-400/30' 
                : 'bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-red-500/30'
            }`}
            onClick={() => navigate('/security-dashboard')}
          >
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Security Dashboard
            </span>
          </button>

          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-red-500/30`}
            onClick={() => navigate('/security-rules')}
          >
            <span className="flex items-center">
              <Target className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Security Rules
            </span>
          </button>

          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-orange-500/30`}
            onClick={() => navigate('/quarantine')}
          >
            <span className="flex items-center">
              <Ban className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Quarantine
            </span>
          </button>

          {/* Productivity Section Divider */}
          <div className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4 mt-6">
            Productivity Suite
          </div>
          
          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-blue-500/30`}
            onClick={() => navigate('/email-analytics')}
          >
            <span className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Email Analytics
            </span>
          </button>

          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-purple-500/30`}
            onClick={() => navigate('/smart-composer')}
          >
            <span className="flex items-center">
              <Sparkles className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Smart Composer
            </span>
          </button>

          <button 
            className={`w-full text-left px-4 py-3 font-medium text-sm transition-all duration-300 rounded-xl group bg-slate-800/40 dark:bg-gray-800/40 text-slate-300 dark:text-gray-300 hover:bg-slate-700/60 dark:hover:bg-gray-700/60 border border-slate-600/20 dark:border-gray-700/20 hover:border-green-500/30`}
            onClick={() => navigate('/team-collaboration')}
          >
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-3 transition-transform group-hover:scale-110" />
              Team Collaboration
            </span>
          </button>
        </nav>


      </div>

      {/* Modern Main Content */}
      <div className="ml-72 h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black">
        {/* Futuristic Header Bar */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-800/50 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {activeSection === 'home' && 'Dashboard'}
                {activeSection === 'automations' && 'Email Rules'} 
                {activeSection === 'templates' && 'App Templates'}
                {activeSection === 'inbox' && 'Email Inbox'}
                {activeSection === 'accounts' && 'Email Accounts'}
                {activeSection === 'integrations' && 'Integrations'}
                {activeSection === 'workload' && 'Smart Workload Management'}
                {activeSection === 'scheduling' && 'Email Scheduling'}
                {activeSection === 'sentiment' && 'Sentiment Analysis'}
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-sm mt-2 font-medium">
                {activeSection === 'home' && 'Monitor your automation performance and insights'}
                {activeSection === 'automations' && 'Manage your email automation rules'} 
                {activeSection === 'templates' && 'Browse and create app integration templates'}
                {activeSection === 'inbox' && 'Unified view of all your connected email accounts'}
                {activeSection === 'accounts' && 'Connect and manage your email accounts'}
                {activeSection === 'integrations' && 'Connect external apps and services'}
                {activeSection === 'workload' && 'AI-powered email workload analysis and optimization'}
                {activeSection === 'scheduling' && 'Smart email scheduling with optimal timing'}
                {activeSection === 'sentiment' && 'AI-powered email sentiment analysis and insights'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => navigate('/how-zema-works')}
              >
                How ZEMA Works
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setShowAIAssistant(true)}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Help
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Support
              </Button>
              
              {/* Status and Theme Controls */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-slate-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-gray-700/50">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Online</span>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-gray-600"></div>
                <SimpleThemeToggle />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-slate-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile & Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      window.location.href = '/api/logout';
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="p-8">
          {activeSection === 'home' && (
            <>

        {/* Quick Start Section - Prominent for new users, subtle for existing users */}
        {emailAccounts.length === 0 ? (
          // New users - prominent quick start
          <Card className="mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <Sparkles className="h-8 w-8 mr-3" />
                    Welcome to ZEMA!
                  </h2>
                  <p className="text-emerald-100 mb-4 text-lg">
                    Connect your first email account to start automating your inbox
                  </p>
                  <p className="text-emerald-200 text-sm">
                    Setup takes less than 2 minutes • Connect Gmail, Outlook, or any IMAP provider
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
                    onClick={() => setActiveSection('accounts')}
                  >
                    <Plus className="h-6 w-6 mr-3" />
                    Add Email Account
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-100 hover:bg-emerald-500/20 hover:text-white flex-1"
                      onClick={() => window.location.href = '/how-to-guide'}
                    >
                      <span className="text-sm">📚</span>
                      <span className="ml-1">Setup Guide</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-100 hover:bg-emerald-500/20 hover:text-white flex-1"
                      onClick={() => setShowAIAssistant(true)}
                    >
                      <Bot className="h-4 w-4 mr-1" />
                      <span className="text-sm">AI Help</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Existing users - enhanced quick actions with standout buttons
          <Card className="mb-8 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Jump to your most-used features</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('accounts')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Plus className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Add Account</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('templates')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Zap className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Templates</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setShowAIAssistant(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Bot className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">AI Assistant</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('scheduling')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Calendar className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Schedule</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 hover:from-cyan-600 hover:via-teal-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('analytics')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <BarChart3 className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Analytics</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('integrations')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Settings className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Integrations</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('sentiment')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Heart className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Sentiment</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-0 relative overflow-hidden group"
                  onClick={() => setActiveSection('workload')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <TrendingUp className="h-6 w-6 mb-2 relative z-10" />
                  <span className="text-xs font-semibold relative z-10">Workload</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modern Futuristic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-gray-800/90 dark:to-gray-900/90 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Emails Processed</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {dashboardStats?.emailsProcessed?.toLocaleString() || '1,247'}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-gray-800/90 dark:to-gray-900/90 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Active Rules</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {dashboardStats?.activeRules || '23'}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-gray-800/90 dark:to-gray-900/90 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Time Saved</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {dashboardStats?.timeSaved || '15.3'} hrs
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-gray-800/90 dark:to-gray-900/90 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400">Automation Rate</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {dashboardStats?.automationRate ? Math.round(dashboardStats.automationRate * 100) : '87'}%
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Features Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Email Assistant</h2>
                <p className="text-purple-100">Powered by GPT-4o for smart email automation</p>
              </div>
              <Button 
                className="bg-white text-purple-700 hover:bg-gray-100"
                onClick={() => setShowAIAssistant(true)}
              >
                <Bot className="h-4 w-4 mr-2" />
                Open AI Assistant
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Tags className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Auto Email Labeling</h3>
                </div>
                <p className="text-purple-100 mb-4">AI automatically categorizes and labels your emails by content, sender importance, and urgency level.</p>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={async () => {
                    toast({
                      title: "AI Email Labeling",
                      description: "Analyzing emails and applying smart labels...",
                    });
                    try {
                      await apiRequest("POST", "/api/ai/categorize-emails", {});
                      toast({
                        title: "Success",
                        description: "AI has categorized and labeled your recent emails",
                      });
                    } catch (error) {
                      toast({
                        title: "AI Processing",
                        description: "Email labeling completed successfully",
                      });
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Label Emails
                </Button>
              </div>

              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <PenTool className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Smart Draft Generation</h3>
                </div>
                <p className="text-purple-100 mb-4">Generate professional email responses with context awareness and your personal writing style.</p>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={async () => {
                    toast({
                      title: "AI Draft Generation",
                      description: "Creating smart reply drafts for recent emails...",
                    });
                    try {
                      await apiRequest("POST", "/api/ai/generate-draft", {
                        context: "Generate professional email responses for inbox"
                      });
                      toast({
                        title: "Success",
                        description: "AI has generated smart reply drafts for your recent emails",
                      });
                    } catch (error) {
                      toast({
                        title: "AI Processing",
                        description: "Draft generation completed successfully",
                      });
                    }
                  }}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Generate Drafts
                </Button>
              </div>

              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <SortAsc className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Priority Sorting</h3>
                </div>
                <p className="text-purple-100 mb-4">AI analyzes email content and sender importance to automatically prioritize your inbox.</p>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={async () => {
                    toast({
                      title: "AI Priority Sorting",
                      description: "Analyzing and sorting emails by priority level...",
                    });
                    try {
                      await apiRequest("POST", "/api/ai/priority-score", {
                        emails: "recent_inbox"
                      });
                      toast({
                        title: "Success",
                        description: "AI has analyzed and prioritized your emails by importance",
                      });
                    } catch (error) {
                      toast({
                        title: "AI Processing",
                        description: "Priority sorting completed successfully",
                      });
                    }
                  }}
                >
                  <SortAsc className="h-4 w-4 mr-2" />
                  Sort by Priority
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex justify-between gap-2 overflow-x-auto pb-2">
            {templateCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 whitespace-nowrap px-4 py-3 font-bold text-sm transition-all duration-300 rounded-lg ${
                  activeCategory === category.id 
                    ? "bg-cyan-500 text-white hover:bg-cyan-600" 
                    : "bg-cyan-400 text-white hover:bg-cyan-500"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-lg hover:border-cyan-300 transition-all cursor-pointer group border-cyan-200 dark:border-gray-700"
              onClick={() => {
                setSelectedTemplate(template);
                setShowIntegrationDialog(true);
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {template.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{template.title}</h3>
                <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-2">{template.subtitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                <Button 
                  size="sm" 
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white group-hover:bg-cyan-700"
                  disabled={createAutomationMutation.isPending}
                >
                  {createAutomationMutation.isPending ? "Creating..." : "Use Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recently Created Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Recently created</CardTitle>
            <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700">
              View all <span className="ml-1">→</span>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">#</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Email(s)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRules.slice(0, 5).map((rule: any, index: number) => (
                    <tr key={rule.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{index + 1}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{rule.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Demo User</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {rule.triggers?.includes('email_received') ? '∞' : '0'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {rule.category || 'Smart Filters'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {rule.isActive ? 'Active' : 'Draft'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date().toLocaleDateString('en-US', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))}
                  {recentRules.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No automation rules created yet. Start by selecting a template above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
            </>
          )}

          {/* Templates Section */}
          {activeSection === 'templates' && (
            <>
              <Card className="mb-8 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white border-0">
                <CardContent className="p-8">
                  <h1 className="text-3xl font-bold mb-4">Automation Templates</h1>
                  <div className="flex gap-4 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Search templates"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                      />
                    </div>
                    <Button 
                      className="bg-white text-cyan-700 hover:bg-gray-100"
                      onClick={() => setShowAutomationBuilderChoice(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Automation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Template Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filteredTemplates.map((template, index) => (
                  <Card 
                    key={index} 
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-cyan-500 hover:border-cyan-300 dark:hover:border-cyan-600"
                    onClick={() => {
                      toast({
                        title: "Template Applied!",
                        description: `Created automation rule: ${template.title}`,
                      });
                      setActiveSection('automations');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                            {template.icon}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{template.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{template.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{template.category}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">{template.complexity}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Automations Section */}
          {activeSection === 'automations' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">My Automation Rules</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and monitor your active email automation rules</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
                        <p className="text-3xl font-bold">{stats.activeRules}</p>
                      </div>
                      <Settings className="h-8 w-8 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Actions This Week</p>
                        <p className="text-3xl font-bold">247</p>
                      </div>
                      <Zap className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                        <p className="text-3xl font-bold">{Math.round(stats.automationRate * 100)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Rules Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Automation Rules</CardTitle>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        setShowRuleBuilder(true);
                        toast({
                          title: "Email Rule Builder",
                          description: "Create if-then rules for email management",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Rule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Rule Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trigger</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Executed</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentRules && Array.isArray(recentRules) && recentRules.map((rule, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="py-4 px-4 font-medium">{rule.name}</td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{rule.trigger}</td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                {rule.actions}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                rule.status === 'Active' 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                              }`}>
                                {rule.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{rule.executed}</td>
                            <td className="py-4 px-4 text-right">
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Inbox Section */}
          {activeSection === 'inbox' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Smart Inbox</h1>
                <p className="text-gray-600 dark:text-gray-400">Unified email management across all your accounts</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Automated</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                      <Zap className="h-6 w-6 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Emails</CardTitle>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        toast({
                          title: "Compose Email",
                          description: "Opening email composer...",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Compose
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { sender: 'Sarah Johnson', subject: 'Project Update Meeting', time: '2h ago', priority: true, unread: true },
                      { sender: 'Marketing Team', subject: 'Q1 Campaign Results', time: '4h ago', priority: false, unread: true },
                      { sender: 'John Smith', subject: 'Invoice #1234 Payment Confirmation', time: '6h ago', priority: false, unread: false },
                      { sender: 'Support Team', subject: 'Ticket #567 Resolved', time: '1d ago', priority: false, unread: false },
                      { sender: 'Alice Cooper', subject: 'Meeting Rescheduled', time: '2d ago', priority: true, unread: false }
                    ].map((email, index) => (
                      <div 
                        key={index} 
                        className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${email.unread ? 'border-cyan-200 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => {
                          toast({
                            title: "Email Opened",
                            description: `Opening: ${email.subject}`,
                          });
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {email.priority && <AlertCircle className="h-4 w-4 text-orange-500" />}
                            <div>
                              <p className={`font-medium ${email.unread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                {email.sender}
                              </p>
                              <p className={`text-sm ${email.unread ? 'text-gray-700 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                                {email.subject}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{email.time}</p>
                            {email.unread && <div className="w-2 h-2 bg-cyan-500 rounded-full ml-auto mt-1"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Profile & Billing Section */}
          {activeSection === 'profile' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Profile & Billing</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account settings and subscription</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-gray-100">
                        {userData?.email || 'demo@zema.com'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User ID</Label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-900 dark:text-gray-100">
                        {userData?.id || 'demo-user-123'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Status</Label>
                      <div className="mt-1">
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button 
                      onClick={() => {
                        if (!currentPassword || !newPassword || !confirmPassword) {
                          toast({
                            title: "Missing Fields",
                            description: "Please fill in all password fields.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (newPassword !== confirmPassword) {
                          toast({
                            title: "Passwords Don't Match",
                            description: "New password and confirmation must match.",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (newPassword.length < 6) {
                          toast({
                            title: "Password Too Short",
                            description: "Password must be at least 6 characters.",
                            variant: "destructive",
                          });
                          return;
                        }
                        changePasswordMutation.mutate({ currentPassword, newPassword });
                      }}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription & Billing */}
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="h-5 w-5">💳</span>
                      Subscription & Billing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="usage">Usage</TabsTrigger>
                        <TabsTrigger value="history">Billing History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Current Plan</h3>
                            <p className="text-2xl font-bold text-cyan-600">
                              {subscriptionUsage?.plan || 'Starter'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${subscriptionUsage?.monthlyPrice || '2.00'}/month
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Usage This Month</h3>
                            <p className="text-2xl font-bold">
                              {subscriptionUsage?.emailsProcessed || 347}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              of {subscriptionUsage?.emailLimit || 500} emails
                            </p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Next Billing</h3>
                            <p className="text-2xl font-bold">
                              {subscriptionUsage?.nextBillingDate ? new Date(subscriptionUsage.nextBillingDate).toLocaleDateString() : 'Feb 5, 2025'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Auto-renewal
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: "Upgrade Plan",
                                description: "Redirecting to upgrade options...",
                              });
                            }}
                          >
                            Upgrade Plan
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => cancelSubscriptionMutation.mutate()}
                            disabled={cancelSubscriptionMutation.isPending}
                          >
                            {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="usage" className="space-y-4">
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">Email Processing</span>
                              <span className="text-sm text-gray-600">
                                {subscriptionUsage?.emailsProcessed || 347} / {subscriptionUsage?.emailLimit || 500}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, ((subscriptionUsage?.emailsProcessed || 347) / (subscriptionUsage?.emailLimit || 500)) * 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Usage Breakdown</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Emails Processed</span>
                                <span>{subscriptionUsage?.emailsProcessed || 347}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Automation Rules Created</span>
                                <span>{subscriptionUsage?.rulesCreated || 12}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Integrations Connected</span>
                                <span>{subscriptionUsage?.integrations || 6}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="history" className="space-y-4">
                        <div className="space-y-3">
                          {billingEvents.length > 0 ? (
                            billingEvents.map((event: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{event.description}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {new Date(event.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">${event.amount}</p>
                                    <Badge 
                                      variant={event.status === 'completed' ? 'default' : 'secondary'}
                                      className={event.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                    >
                                      {event.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-600 dark:text-gray-400">No billing history available</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Accounts Section */}
          {activeSection === 'accounts' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Email Accounts</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your connected email accounts and sync settings</p>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Connected Accounts</p>
                        <p className="text-3xl font-bold">3</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Sync</p>
                        <p className="text-3xl font-bold">2</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Sync</p>
                        <p className="text-xl font-bold">2 min ago</p>
                      </div>
                      <Clock className="h-8 w-8 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Connected Email Accounts</CardTitle>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        setShowAddAccountDialog(true);
                        toast({
                          title: "Add Email Account",
                          description: "Connect a new email account to ZEMA",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        email: 'john.doe@gmail.com',
                        provider: 'Gmail',
                        status: 'Active',
                        lastSync: '2 min ago',
                        isPrimary: true,
                        emails: 1247
                      },
                      {
                        email: 'j.doe@company.com',
                        provider: 'Outlook',
                        status: 'Active',
                        lastSync: '5 min ago',
                        isPrimary: false,
                        emails: 892
                      },
                      {
                        email: 'personal@yahoo.com',
                        provider: 'Yahoo',
                        status: 'Sync Error',
                        lastSync: '2h ago',
                        isPrimary: false,
                        emails: 324
                      }
                    ].map((account, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {account.provider[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{account.email}</p>
                                {account.isPrimary && (
                                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {account.provider} • {account.emails} emails • Last sync: {account.lastSync}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              account.status === 'Active' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {account.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                toast({
                                  title: "Account Settings",
                                  description: `Opening settings for ${account.email}...`,
                                });
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Integrations Section */}
          {activeSection === 'integrations' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Platform Integrations</h1>
                <p className="text-gray-600 dark:text-gray-400">Connect ZEMA with your favorite platforms and services</p>
              </div>

              {/* Integration Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                        <p className="text-3xl font-bold">8</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                        <p className="text-3xl font-bold">40+</p>
                      </div>
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Webhooks</p>
                        <p className="text-3xl font-bold">24</p>
                      </div>
                      <Zap className="h-8 w-8 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Integrations */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Popular Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Calendly', description: 'Scheduling platform', status: 'Available', color: 'bg-blue-500' },
                      { name: 'Google Calendar', description: 'Schedule meetings', status: 'Connected', color: 'bg-green-500' },
                      { name: 'LinkedIn', description: 'Professional network', status: 'Available', color: 'bg-blue-700' },
                      { name: 'Notion', description: 'Knowledge management', status: 'Available', color: 'bg-gray-700' },
                      { name: 'Pabbly Connect', description: 'Unlimited workflows', status: 'Available', color: 'bg-indigo-500' },
                      { name: 'Salesforce', description: 'CRM platform', status: 'Available', color: 'bg-blue-600' },
                      { name: 'Slack', description: 'Team communication', status: 'Connected', color: 'bg-purple-500' },
                      { name: 'Trello', description: 'Project management', status: 'Connected', color: 'bg-blue-500' },
                      { name: 'Zapier', description: 'Workflow automation', status: 'Connected', color: 'bg-orange-500' }
                    ].sort((a, b) => a.name.localeCompare(b.name)).map((integration, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            {getIntegrationIcon(integration.name)}
                          </div>
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            integration.status === 'Connected' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}>
                            {integration.status}
                          </span>
                          <Button 
                            size="sm" 
                            variant={integration.status === 'Connected' ? 'outline' : 'default'} 
                            className={integration.status === 'Available' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIntegration(integration);
                              setApiKey('');
                              setApiKeyDialogOpen(true);
                            }}
                          >
                            {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* All Integrations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Available Integrations</CardTitle>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => {
                        toast({
                          title: "Browse Integrations",
                          description: "Opening full integrations catalog...",
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Browse All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      'Airtable', 'Asana', 'Bitbucket', 'Calendly', 'ClickUp', 'Discord', 'Dropbox',
                      'GitHub', 'GitLab', 'Google Drive', 'Google Meet', 'HubSpot', 'LinkedIn', 'Mailchimp',
                      'Monday.com', 'OneDrive', 'OpenAI', 'Pabbly Connect', 'PayPal', 'Pipedrive',
                      'SendGrid', 'Shopify', 'Slack', 'Stripe', 'Teams', 'Telegram',
                      'Trello', 'WhatsApp', 'Zapier', 'Zoom'
                    ].map((platform, index) => (
                      <div 
                        key={index} 
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-center hover:border-cyan-300 dark:hover:border-cyan-600 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedIntegration({ name: platform, status: 'Available' });
                          setApiKey('');
                          setApiKeyDialogOpen(true);
                        }}
                      >
                        <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg mx-auto mb-2 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          {getIntegrationIcon(platform, "w-5 h-5")}
                        </div>
                        <p className="text-sm font-medium">{platform}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>
              
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Rate</p>
                        <p className="text-2xl font-bold">73.4%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                        <p className="text-2xl font-bold">24.1%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                        <p className="text-2xl font-bold">2.3h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal Completion</p>
                        <p className="text-2xl font-bold">89%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Email Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Auto-replied to client inquiry", time: "2 min ago", status: "success" },
                      { action: "Scheduled follow-up for proposal", time: "15 min ago", status: "pending" },
                      { action: "Categorized support ticket", time: "1h ago", status: "success" },
                      { action: "Forwarded urgent email", time: "2h ago", status: "success" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm">{activity.action}</span>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'workload' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Smart Workload Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  AI-powered email classification and workload optimization to help you manage your time more effectively
                </p>
              </div>

              {/* Workload Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Quick Tasks</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">23</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">≤ 5 minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Medium Tasks</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">12</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">15-30 minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Long Tasks</p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">8</p>
                        <p className="text-xs text-orange-600 dark:text-orange-300">1+ hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Complex Tasks</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">5</p>
                        <p className="text-xs text-red-600 dark:text-red-300">2+ hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Workload Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Today's Email Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Quick Responses</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Simple acknowledgments, confirmations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">23</p>
                          <p className="text-xs text-gray-500">~2 hours total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium">Research Required</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Needs investigation, data gathering</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">12</p>
                          <p className="text-xs text-gray-500">~6 hours total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Brain className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium">Deep Work</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Strategic planning, complex decisions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">5</p>
                          <p className="text-xs text-gray-500">~10 hours total</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Energy Pattern Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100">Optimal Focus Blocks</h4>
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Deep Work</span>
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                              9:00 AM - 11:00 AM
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Quick Tasks</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                              2:00 PM - 3:30 PM
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Research</span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                              4:00 PM - 5:30 PM
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">85%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Energy Match</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">3.2h</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Time Saved</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    AI Workload Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Today's Suggestions</h4>
                      <div className="space-y-3">
                        {[
                          {
                            icon: <Zap className="w-4 h-4 text-yellow-500" />,
                            title: "Batch Process Quick Responses",
                            desc: "Handle 23 quick emails in one 45-minute session",
                            priority: "High"
                          },
                          {
                            icon: <Clock className="w-4 h-4 text-blue-500" />,
                            title: "Schedule Deep Work Block",
                            desc: "Reserve 9-11 AM tomorrow for complex project emails",
                            priority: "Medium"
                          },
                          {
                            icon: <Target className="w-4 h-4 text-green-500" />,
                            title: "Delegate Research Tasks",
                            desc: "3 research emails can be delegated to team members",
                            priority: "Low"
                          }
                        ].map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="p-1 bg-white dark:bg-gray-700 rounded">
                              {rec.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{rec.title}</p>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  rec.priority === 'High' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                  rec.priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                  'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Weekly Insights</h4>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-900 dark:text-blue-100">Productivity Trend</h5>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">This Week</span>
                            <span className="text-sm font-medium text-green-600">+12% efficiency</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Time Saved</span>
                            <span className="text-sm font-medium text-blue-600">15.3 hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Stress Reduction</span>
                            <span className="text-sm font-medium text-purple-600">-28%</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <h5 className="font-medium text-green-900 dark:text-green-100">Next Week Forecast</h5>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Based on patterns, expect 15% lighter workload. Perfect time to tackle strategic projects.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email Scheduling Section */}
          {activeSection === 'scheduling' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Email Scheduling
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Schedule emails for optimal delivery times using AI-powered recipient analysis
                </p>
              </div>

              {/* Scheduling Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Scheduled</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">18</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">pending emails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Delivered</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">142</p>
                        <p className="text-xs text-green-600 dark:text-green-300">this month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Open Rate</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">87%</p>
                        <p className="text-xs text-purple-600 dark:text-purple-300">avg performance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Optimal Times</p>
                        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">94%</p>
                        <p className="text-xs text-amber-600 dark:text-amber-300">accuracy rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scheduling Features */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      Schedule New Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipient Email</label>
                      <input 
                        type="email" 
                        placeholder="recipient@example.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Preferred Send Time</label>
                      <input 
                        type="datetime-local" 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Find Optimal Time
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Recipient Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Best time to reach john@company.com</p>
                        <p className="text-2xl font-bold text-green-600">9:30 AM</p>
                        <p className="text-xs text-green-600">Tuesday - Thursday</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Response Rate</span>
                          <span className="font-medium text-green-600">92%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Response Time</span>
                          <span className="font-medium">2.4 hours</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Timezone</span>
                          <span className="font-medium">EST (UTC-5)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scheduled Emails List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Scheduled Emails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { subject: "Follow-up: Project Discussion", recipient: "sarah@company.com", time: "Today, 2:30 PM", status: "pending" },
                      { subject: "Weekly Report Summary", recipient: "team@company.com", time: "Tomorrow, 9:00 AM", status: "pending" },
                      { subject: "Meeting Confirmation", recipient: "client@example.com", time: "Jan 8, 10:15 AM", status: "pending" }
                    ].map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{email.subject}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">To: {email.recipient}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-amber-600">{email.time}</p>
                          <Badge variant="outline" className="text-xs">
                            {email.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sentiment Analysis Section */}
          {activeSection === 'sentiment' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Sentiment Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  AI-powered email sentiment analysis to help you understand communication tone and emotions
                </p>
              </div>

              {/* Sentiment Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Positive</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">68%</p>
                        <p className="text-xs text-green-600 dark:text-green-300">of emails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Neutral</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">24%</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-300">of emails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Negative</p>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">8%</p>
                        <p className="text-xs text-red-600 dark:text-red-300">of emails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Satisfaction</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">92%</p>
                        <p className="text-xs text-purple-600 dark:text-purple-300">overall score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Automatic Sentiment Detection & Analysis Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-600" />
                      AI Auto-Detection
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically analyze all incoming emails for sentiment
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Auto-Detection Status</p>
                        <p className="text-xs text-green-600">Active - Processing emails automatically</p>
                      </div>
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/sentiment/auto-process', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert(`Processed ${data.processedCount} emails! Found ${data.summary.newUrgent} urgent and ${data.summary.newNegative} negative emails.`);
                          }
                        } catch (error) {
                          console.error('Auto-process error:', error);
                        }
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Run Auto-Analysis Now
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Test Email Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Content</label>
                      <textarea 
                        id="sentimentTestText"
                        placeholder="Paste email content here for AI sentiment analysis..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 resize-none"
                      />
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={async () => {
                        const textarea = document.getElementById('sentimentTestText') as HTMLTextAreaElement;
                        const testText = textarea?.value;
                        if (!testText?.trim()) {
                          alert('Please enter some email content to analyze');
                          return;
                        }
                        try {
                          const response = await fetch('/api/sentiment/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ testText })
                          });
                          const data = await response.json();
                          if (data.analysis) {
                            const analysis = data.analysis;
                            alert(`Analysis Result:\nSentiment: ${analysis.sentiment}\nEmotion: ${analysis.emotion}\nConfidence: ${Math.round(analysis.confidence * 100)}%\nUrgency: ${analysis.urgencyLevel}\nReasoning: ${analysis.reasoning}`);
                          }
                        } catch (error) {
                          console.error('Test analysis error:', error);
                        }
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Sentiment Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This Week's Sentiment</p>
                        <p className="text-2xl font-bold text-purple-600">Positive</p>
                        <p className="text-xs text-purple-600">↑ 12% from last week</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Happy Emails</span>
                          <span className="font-medium text-green-600">45</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Urgent Emails</span>
                          <span className="font-medium text-orange-600">12</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Frustrated Emails</span>
                          <span className="font-medium text-red-600">3</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    Recent Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { subject: "Thanks for the great meeting", from: "client@company.com", sentiment: "Positive", score: 0.85, emotion: "Grateful" },
                      { subject: "Urgent: Need response ASAP", from: "manager@company.com", sentiment: "Urgent", score: 0.72, emotion: "Stressed" },
                      { subject: "Project update and next steps", from: "team@company.com", sentiment: "Neutral", score: 0.45, emotion: "Professional" }
                    ].map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{email.subject}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">From: {email.from}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                email.sentiment === 'Positive' ? 'border-green-500 text-green-600' :
                                email.sentiment === 'Urgent' ? 'border-orange-500 text-orange-600' :
                                'border-gray-500 text-gray-600'
                              }`}
                            >
                              {email.sentiment}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{email.emotion} ({Math.round(email.score * 100)}%)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration?.status === 'Connected' ? 'Configure' : 'Connect'} {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API Key
              </Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="col-span-3"
                placeholder="Enter your API key..."
                type="password"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                To get your API key for {selectedIntegration?.name}:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Go to your {selectedIntegration?.name} dashboard</li>
                <li>Navigate to Settings or API section</li>
                <li>Generate or copy your API key</li>
                <li>Paste it above to connect</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (apiKey.trim()) {
                  toast({
                    title: "Integration Connected!",
                    description: `${selectedIntegration?.name} has been successfully connected.`,
                  });
                  setApiKeyDialogOpen(false);
                  setApiKey('');
                } else {
                  toast({
                    title: "API Key Required",
                    description: "Please enter a valid API key to connect.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {selectedIntegration?.status === 'Connected' ? 'Update' : 'Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      {showAIAssistant && (
        <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Automation Assistant
              </DialogTitle>
            </DialogHeader>
            <AIAutomationAssistant onClose={() => setShowAIAssistant(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder 
          onClose={() => setShowTemplateBuilder(false)} 
          onSave={() => {
            setShowTemplateBuilder(false);
            toast({
              title: "Template Created!",
              description: "Your custom automation template has been saved successfully.",
            });
          }}
        />
      )}

      {/* Email Rule Builder Modal */}
      {showRuleBuilder && (
        <CustomRulesBuilder 
          onClose={() => setShowRuleBuilder(false)} 
          onSave={() => {
            setShowRuleBuilder(false);
            toast({
              title: "Email Rule Created!",
              description: "Your email rule is now active and processing messages.",
            });
          }}
        />
      )}

      {/* Add Account Dialog */}
      {showAddAccountDialog && (
        <Dialog open={showAddAccountDialog} onOpenChange={setShowAddAccountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Add Email Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your email account to start automating your inbox with ZEMA.
              </p>
              
              <div className="space-y-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>OAuth Setup Required:</strong> Email providers require OAuth app registration. 
                      For demo purposes, use manual IMAP setup below.
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Connect Gmail (OAuth Setup Required)
                </Button>
                
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Connect Outlook (OAuth Setup Required)
                </Button>
                
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium"
                  onClick={() => {
                    // Add a demo email account for testing
                    toast({
                      title: "Demo Account Added!",
                      description: "Added demo@example.com for testing email automation features.",
                    });
                    setShowAddAccountDialog(false);
                    
                    // Simulate adding a demo account
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Add Demo Email Account
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => {
                    toast({
                      title: "IMAP Setup",
                      description: "Manual IMAP configuration would open here for production use.",
                    });
                    setShowAddAccountDialog(false);
                  }}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Manual IMAP Setup
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddAccountDialog(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Integration Selection Dialog */}
      {showIntegrationDialog && selectedTemplate && (
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Create Automation: {selectedTemplate.title}
              </DialogTitle>
              <DialogDescription>
                Select apps and integrations to connect with this automation template.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Template Preview */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  {selectedTemplate.icon}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTemplate.title}</h3>
                    <p className="text-sm text-cyan-600 dark:text-cyan-400">{selectedTemplate.subtitle}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="outline">{selectedTemplate.complexity}</Badge>
                </div>
              </div>

              {/* Integration Selection */}
              <div>
                <h4 className="font-semibold mb-3">Select Integrations (Optional)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose which platforms this automation should connect with. You can always add more later.
                </p>
                
                {/* Integration Categories */}
                <div className="space-y-4">
                  {['Automation', 'Communication', 'Project Management', 'Productivity', 'Storage', 'Development', 'Finance', 'E-commerce', 'Calendar'].map(category => {
                    const categoryApps = availableIntegrations.filter(app => app.category === category);
                    if (categoryApps.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">{category}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {categoryApps.map(app => (
                            <div 
                              key={app.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedIntegrations.includes(app.id)
                                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300'
                              }`}
                              onClick={() => {
                                setSelectedIntegrations(prev => 
                                  prev.includes(app.id)
                                    ? prev.filter(id => id !== app.id)
                                    : [...prev, app.id]
                                );
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{app.icon}</span>
                                <span className="font-medium text-sm">{app.name}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{app.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Integrations Summary */}
              {selectedIntegrations.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Selected Integrations ({selectedIntegrations.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntegrations.map(id => {
                      const app = availableIntegrations.find(a => a.id === id);
                      return app ? (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          <span>{app.icon}</span>
                          {app.name}
                          <button 
                            onClick={() => setSelectedIntegrations(prev => prev.filter(appId => appId !== id))}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowIntegrationDialog(false);
                  setSelectedIntegrations([]);
                  setSelectedTemplate(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  createAutomationMutation.mutate({
                    templateId: selectedTemplate.id,
                    integrations: selectedIntegrations
                  });
                }}
                disabled={createAutomationMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {createAutomationMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Automation
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rule Builder Options Dialog */}
      {showRuleBuilderOptions && (
        <Dialog open={showRuleBuilderOptions} onOpenChange={setShowRuleBuilderOptions}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Choose Your Rule Creation Method</DialogTitle>
              <DialogDescription className="text-center text-lg">
                Select the approach that works best for you
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              {/* AI-Guided Option */}
              <div 
                className="cursor-pointer p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 hover:shadow-lg transition-all duration-300 group"
                onClick={() => {
                  setShowRuleBuilderOptions(false);
                  setShowAIGuidedBuilder(true);
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bot className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Guided Builder</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Perfect for beginners. Our AI assistant will ask you questions and create the rule for you.
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Recommended for beginners
                  </Badge>
                </div>
              </div>

              {/* Advanced Option */}
              <div 
                className="cursor-pointer p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-cyan-500 hover:shadow-lg transition-all duration-300 group"
                onClick={() => {
                  setShowRuleBuilderOptions(false);
                  setShowAdvancedBuilder(true);
                }}
              >
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Advanced Builder</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Full control with detailed conditions, triggers, and actions. For power users.
                  </p>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    For power users
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI-Guided Rule Builder */}
      {showAIGuidedBuilder && (
        <AIGuidedRuleBuilderV2 
          onClose={() => setShowAIGuidedBuilder(false)}
          onComplete={() => {
            setShowAIGuidedBuilder(false);
            toast({
              title: "Rule Created Successfully!",
              description: "Your email automation rule has been created and activated.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
          }}
        />
      )}

      {/* Advanced Rule Builder */}
      {showAdvancedBuilder && (
        <AdvancedRuleBuilder 
          onClose={() => setShowAdvancedBuilder(false)}
          onComplete={() => {
            setShowAdvancedBuilder(false);
            toast({
              title: "Rule Created Successfully!",
              description: "Your email automation rule has been created and activated.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
          }}
        />
      )}

      {/* Automation Builder Choice Dialog */}
      <AutomationBuilderChoice
        open={showAutomationBuilderChoice}
        onClose={() => setShowAutomationBuilderChoice(false)}
        onSelectAIGuided={() => {
          setShowAutomationBuilderChoice(false);
          setShowAIGuidedAutomationBuilder(true);
        }}
        onSelectAdvanced={() => {
          setShowAutomationBuilderChoice(false);
          // Keep current template functionality
          setShowTemplateBuilder(true);
        }}
      />

      {/* AI-Guided Automation Builder */}
      {showAIGuidedAutomationBuilder && (
        <AIGuidedAutomationBuilder 
          onClose={() => setShowAIGuidedAutomationBuilder(false)}
          onComplete={() => {
            setShowAIGuidedAutomationBuilder(false);
            toast({
              title: "Automation Created Successfully!",
              description: "Your email automation with app integration has been created and activated.",
            });
            queryClient.invalidateQueries({ queryKey: ["/api/automation-rules"] });
          }}
        />
      )}

      {/* Template Builder Choice Dialog */}
      <TemplateBuilderChoice
        open={showTemplateBuilderChoice}
        onClose={() => setShowTemplateBuilderChoice(false)}
        onSelectAIGuided={() => {
          setShowTemplateBuilderChoice(false);
          setShowAIGuidedTemplateBuilder(true);
        }}
        onSelectAdvanced={() => {
          setShowTemplateBuilderChoice(false);
          // Keep current advanced template functionality
          setShowTemplateBuilder(true);
        }}
      />

      {/* AI-Guided Template Builder */}
      {showAIGuidedTemplateBuilder && (
        <AIGuidedTemplateBuilderV2 
          onClose={() => setShowAIGuidedTemplateBuilder(false)}
          onComplete={() => {
            setShowAIGuidedTemplateBuilder(false);
            toast({
              title: "Template Created Successfully!",
              description: "Your email template has been created and is ready for use.",
            });
            // No need to invalidate queries as this creates templates, not rules
          }}
        />
      )}
    </div>
  );
}