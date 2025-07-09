import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Demo from "@/pages/demo";
import UserDashboard from "@/pages/user-dashboard";
import UserDashboardV2 from "@/pages/user-dashboard-v2";
import Integrations from "@/pages/integrations";
import PlatformIntegrations from "@/pages/platform-integrations";
import EmailAccounts from "@/pages/email-accounts";
import Inbox from "@/pages/inbox";
import AutomationTemplates from "@/pages/automation-templates";
import Webhooks from "@/pages/webhooks";
import { ProtectedRoute } from "@/components/protected-route";
import Subscription from "@/pages/subscription";
import Subscribe from "@/pages/subscribe";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import SignIn from "@/pages/sign-in";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import SecurityDashboard from "@/pages/security-dashboard";
import SecurityRules from "@/pages/security-rules";
import Quarantine from "@/pages/quarantine";
import EmailAnalytics from "@/pages/email-analytics";
import SmartComposer from "@/pages/smart-composer";
import TeamCollaboration from "@/pages/team-collaboration";
import AIFeatures from "@/pages/ai-features";
import EmailScheduling from "@/pages/email-scheduling";
import EmailSentiment from "@/pages/email-sentiment";
import SmartWorkload from "@/pages/smart-workload";
import PredictiveAnalytics from "@/pages/predictive-analytics";
import CrossAccountIntelligence from "@/pages/cross-account-intelligence";
import VoiceAssistant from "@/pages/voice-assistant";
import EmailViewerDemo from "@/pages/email-viewer-demo";
import HowToGuide from "@/pages/how-to-guide";
import HowZemaWorks from "@/pages/how-zema-works";
import EmailPerformancePage from "@/pages/email-performance";
import EmailSyncDemo from "@/pages/email-sync-demo";
import BillingPage from "@/pages/billing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo" component={Demo} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboardV2 />
        </ProtectedRoute>
      </Route>
      <Route path="/user-dashboard-v2">
        <ProtectedRoute>
          <UserDashboardV2 />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard-legacy">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/integrations">
        <ProtectedRoute>
          <Integrations />
        </ProtectedRoute>
      </Route>
      <Route path="/platform-integrations">
        <ProtectedRoute>
          <PlatformIntegrations />
        </ProtectedRoute>
      </Route>
      <Route path="/email-accounts">
        <ProtectedRoute>
          <EmailAccounts />
        </ProtectedRoute>
      </Route>
      <Route path="/inbox">
        <ProtectedRoute>
          <Inbox />
        </ProtectedRoute>
      </Route>
      <Route path="/automation-templates">
        <ProtectedRoute>
          <AutomationTemplates />
        </ProtectedRoute>
      </Route>
      <Route path="/webhooks">
        <ProtectedRoute>
          <Webhooks />
        </ProtectedRoute>
      </Route>
      <Route path="/ai-features">
        <ProtectedRoute>
          <AIFeatures />
        </ProtectedRoute>
      </Route>
      <Route path="/security-rules">
        <ProtectedRoute>
          <SecurityRules />
        </ProtectedRoute>
      </Route>
      <Route path="/quarantine">
        <ProtectedRoute>
          <Quarantine />
        </ProtectedRoute>
      </Route>
      <Route path="/email-analytics">
        <ProtectedRoute>
          <EmailAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/smart-composer">
        <ProtectedRoute>
          <SmartComposer />
        </ProtectedRoute>
      </Route>
      <Route path="/team-collaboration">
        <ProtectedRoute>
          <TeamCollaboration />
        </ProtectedRoute>
      </Route>
      <Route path="/email-scheduling">
        <ProtectedRoute>
          <EmailScheduling />
        </ProtectedRoute>
      </Route>
      <Route path="/email-sentiment">
        <ProtectedRoute>
          <EmailSentiment />
        </ProtectedRoute>
      </Route>
      <Route path="/smart-workload">
        <ProtectedRoute>
          <SmartWorkload />
        </ProtectedRoute>
      </Route>
      <Route path="/predictive-analytics">
        <ProtectedRoute>
          <PredictiveAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/cross-account-intelligence">
        <ProtectedRoute>
          <CrossAccountIntelligence />
        </ProtectedRoute>
      </Route>
      <Route path="/security-dashboard">
        <ProtectedRoute>
          <SecurityDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/voice-assistant">
        <ProtectedRoute>
          <VoiceAssistant />
        </ProtectedRoute>
      </Route>
      <Route path="/email-demo">
        <ProtectedRoute>
          <EmailViewerDemo />
        </ProtectedRoute>
      </Route>
      <Route path="/email-performance">
        <ProtectedRoute>
          <EmailPerformancePage />
        </ProtectedRoute>
      </Route>
      <Route path="/email-sync">
        <ProtectedRoute>
          <EmailSyncDemo />
        </ProtectedRoute>
      </Route>
      <Route path="/how-to-guide" component={HowToGuide} />
      <Route path="/how-zema-works" component={HowZemaWorks} />
      <Route path="/pricing" component={Subscribe} />
      <Route path="/billing">
        <ProtectedRoute>
          <BillingPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/security" component={SecurityDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="zema-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
