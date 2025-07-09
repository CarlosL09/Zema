import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Reply, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Mail,
  Clock,
  Shield,
  Bot,
  Sparkles,
  Settings,
  Users,
  Target,
  Zap
} from "lucide-react";
import zemaLogo from "@assets/41_1751750660031.png";

const templates = [
  {
    id: "welcome_email",
    name: "Welcome Email Template",
    description: "Professional welcome message for new customers or team members",
    category: "Communication",
    icon: <Mail className="w-5 h-5" />,
    features: ["Customizable greeting", "Contact information", "Next steps"],
    difficulty: "Easy"
  },
  {
    id: "meeting_request",
    name: "Meeting Request Template",
    description: "Professional meeting invitation with agenda and time slots",
    category: "Scheduling",
    icon: <Calendar className="w-5 h-5" />,
    features: ["Agenda outline", "Time slot options", "Location details"],
    difficulty: "Easy"
  },
  {
    id: "follow_up",
    name: "Follow-up Email Template",
    description: "Gentle follow-up for pending responses or actions",
    category: "Communication",
    icon: <Reply className="w-5 h-5" />,
    features: ["Polite reminder", "Action items", "Timeline reference"],
    difficulty: "Easy"
  },
  {
    id: "thank_you",
    name: "Thank You Template",
    description: "Express gratitude for meetings, purchases, or collaboration",
    category: "Communication",
    icon: <TrendingUp className="w-5 h-5" />,
    features: ["Personalized message", "Key highlights", "Future steps"],
    difficulty: "Easy"
  },
  {
    id: "project_update",
    name: "Project Status Update",
    description: "Regular project progress report template",
    category: "Productivity",
    icon: <FileText className="w-5 h-5" />,
    features: ["Progress summary", "Next milestones", "Issue tracking"],
    difficulty: "Easy"
  },
  {
    id: "customer_support",
    name: "Customer Support Response",
    description: "Professional customer service email template",
    category: "Support",
    icon: <Users className="w-5 h-5" />,
    features: ["Issue acknowledgment", "Solution steps", "Contact information"],
    difficulty: "Easy"
  },
  {
    id: "auto_forward",
    name: "Email Auto-Forward Rule",
    description: "Automatically forward emails based on sender or subject",
    category: "Organization",
    icon: <Filter className="w-5 h-5" />,
    features: ["Sender filtering", "Subject keywords", "Target recipients"],
    difficulty: "Medium"
  },
  {
    id: "label_organizer",
    name: "Email Label Organizer",
    description: "Automatically apply labels based on content patterns",
    category: "Organization", 
    icon: <Settings className="w-5 h-5" />,
    features: ["Pattern matching", "Custom labels", "Priority sorting"],
    difficulty: "Medium"
  },
  {
    id: "newsletter_manager",
    name: "Newsletter Automation",
    description: "Automatically sort newsletters, extract key insights, and schedule reading time",
    category: "Organization",
    icon: <Mail className="w-5 h-5" />,
    features: ["Newsletter detection", "Content extraction", "Reading scheduler"],
    difficulty: "Easy"
  },
  {
    id: "expense_tracker",
    name: "Receipt & Expense Tracker",
    description: "Automatically detect receipt emails and categorize expenses for accounting",
    category: "Finance",
    icon: <Target className="w-5 h-5" />,
    features: ["Receipt detection", "Expense categorization", "Accounting integration"],
    difficulty: "Medium"
  },
  {
    id: "team_coordinator",
    name: "Team Communication Hub",
    description: "Coordinate team communications and automatically distribute relevant information",
    category: "Team Management",
    icon: <Users className="w-5 h-5" />,
    features: ["Team routing", "Information distribution", "Collaboration tools"],
    difficulty: "Advanced"
  },
  {
    id: "workflow_trigger",
    name: "Workflow Trigger Engine",
    description: "Trigger external workflows and integrations based on email content and patterns",
    category: "Integration",
    icon: <Zap className="w-5 h-5" />,
    features: ["External triggers", "Workflow automation", "Multi-platform integration"],
    difficulty: "Advanced"
  }
];

const categories = [
  { name: "Organization", count: 3, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { name: "Communication", count: 1, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  { name: "Productivity", count: 2, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  { name: "Scheduling", count: 1, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { name: "Sales", count: 1, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  { name: "Security", count: 1, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { name: "Finance", count: 1, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  { name: "Team Management", count: 1, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { name: "Integration", count: 1, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" }
];

export default function TemplatesPreview() {
  return (
    <section id="templates" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <img 
              src={zemaLogo} 
              alt="ZEMA" 
              className="h-20 md:h-24 lg:h-32 w-auto opacity-90 brightness-105 drop-shadow-lg hover:opacity-100 hover:scale-105 transition-all duration-500"
            />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            12 Proven Templates That Handle Your Email For You
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            Stop manually sorting, responding, and managing emails. Each template is battle-tested by thousands of professionals and <strong>activates in under 60 seconds</strong>. Plus, our AI assistant can create custom automations tailored to your unique business needs.
          </motion.p>
          
          {/* Categories Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {categories.map((category, index) => (
              <Badge key={category.name} className={`${category.color} px-3 py-1`}>
                {category.name} ({category.count})
              </Badge>
            ))}
          </motion.div>
        </div>

        {/* Custom Creation Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-8 mb-12 border border-cyan-200 dark:border-cyan-800"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-cyan-500 mr-3" />
              <Sparkles className="w-8 h-8 text-blue-500 mr-3" />
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Need Something Unique? Build It In Minutes
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Everyone's email needs are different. That's why ZEMA lets you create custom automation rules that fit your exact lifestyle. Use our <strong>drag-and-drop builder</strong> for precision control, or simply <strong>tell our AI what you need</strong> in plain English and watch it build the automation for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <Bot className="w-10 h-10 text-cyan-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Creation</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Describe what you want to automate in plain English, and our AI will create the perfect template for you.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <Settings className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visual Builder</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Use our drag-and-drop interface to build complex automation workflows with triggers, conditions, and actions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                      {template.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={
                    template.category === "Organization" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                    template.category === "Communication" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                    template.category === "Productivity" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                    template.category === "Scheduling" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                    template.category === "Sales" ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" :
                    template.category === "Security" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                    template.category === "Finance" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    template.category === "Team Management" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
                    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                  }>
                    {template.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {template.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Key Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/automation-templates">
            <Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Sparkles className="w-5 h-5 mr-2" />
              Browse All Templates
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}